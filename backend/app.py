from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import subprocess
import platform
from commands.file_operations import FileOperations
from commands.system_commands import SystemCommands
from commands.network_commands import NetworkCommands

app = Flask(__name__)

# Configure CORS
CORS(app, resources={
    r"/execute": {"origins": ["https://*.netlify.app", "http://localhost:3000"]},
    r"/history": {"origins": ["https://*.netlify.app", "http://localhost:3000"]}
})

class TerminalController:
    def __init__(self):
        self.current_directory = os.getcwd()
        self.file_ops = FileOperations()
        self.sys_commands = SystemCommands()
        self.net_commands = NetworkCommands()
        self.command_history = []
        self.env_variables = dict(os.environ)

    def execute_command(self, command):
        try:
            parts = command.split()
            base_command = parts[0].lower()
            args = parts[1:] if len(parts) > 1 else []

            # Basic file operations
            if base_command == 'ls':
                return self.file_ops.list_directory(self.current_directory)
            elif base_command == 'cd':
                new_dir = args[0] if args else os.path.expanduser('~')
                self.current_directory = self.file_ops.change_directory(new_dir)
                return f"Changed directory to {self.current_directory}"
            elif base_command == 'pwd':
                return self.current_directory
            elif base_command == 'mkdir':
                return self.file_ops.make_directory(args[0])
            elif base_command == 'rm':
                return self.file_ops.remove(args[0], recursive='-r' in args)
            
            # System commands
            elif base_command == 'ps':
                return self.sys_commands.list_processes()
            elif base_command == 'echo':
                return ' '.join(args)
            elif base_command == 'env':
                return self.env_variables
            elif base_command == 'clear':
                return 'CLEAR_TERMINAL'
            
            # Network commands
            elif base_command == 'ping':
                return self.net_commands.ping(args[0])
            elif base_command == 'curl':
                return self.net_commands.curl(args[0])
            elif base_command == 'ifconfig':
                return self.net_commands.get_network_info()

            # Execute system commands
            else:
                result = subprocess.run(
                    parts,
                    cwd=self.current_directory,
                    capture_output=True,
                    text=True
                )
                return result.stdout if result.stdout else result.stderr

        except Exception as e:
            return f"Error: {str(e)}"

terminal = TerminalController()

@app.route('/execute', methods=['POST'])
def execute():
    command = request.json.get('command')
    if not command:
        return jsonify({'error': 'No command provided'}), 400

    terminal.command_history.append(command)
    result = terminal.execute_command(command)
    
    return jsonify({
        'result': result,
        'currentDirectory': terminal.current_directory
    })

@app.route('/history', methods=['GET'])
def get_history():
    return jsonify(terminal.command_history)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)