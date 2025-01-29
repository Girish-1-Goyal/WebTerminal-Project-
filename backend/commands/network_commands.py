import socket
import subprocess
import requests
import psutil

class NetworkCommands:
    def ping(self, host, count=4):
        try:
            import platform
            param = '-n' if platform.system().lower() == 'windows' else '-c'
            command = ['ping', param, str(count), host]
            return subprocess.run(command, capture_output=True, text=True).stdout
        except Exception as e:
            return f"Error: {str(e)}"

    def curl(self, url):
        try:
            response = requests.get(url)
            return {
                'status_code': response.status_code,
                'headers': dict(response.headers),
                'content': response.text[:1000]  # Limit content size
            }
        except Exception as e:
            return f"Error: {str(e)}"

    def get_network_info(self):
        interfaces = {}
        for interface, addresses in psutil.net_if_addrs().items():
            interfaces[interface] = [addr._asdict() for addr in addresses]
        return interfaces