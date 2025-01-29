import os
import shutil

class FileOperations:
    def list_directory(self, path):
        files = os.listdir(path)
        result = []
        for file in files:
            full_path = os.path.join(path, file)
            stats = os.stat(full_path)
            result.append({
                'name': file,
                'size': stats.st_size,
                'modified': stats.st_mtime,
                'type': 'directory' if os.path.isdir(full_path) else 'file'
            })
        return result

    def change_directory(self, path):
        abs_path = os.path.abspath(os.path.expanduser(path))
        if os.path.exists(abs_path):
            os.chdir(abs_path)
            return abs_path
        raise Exception(f"Directory {path} does not exist")

    def make_directory(self, path):
        os.makedirs(path, exist_ok=True)
        return f"Created directory: {path}"

    def remove(self, path, recursive=False):
        if recursive:
            shutil.rmtree(path)
        else:
            os.remove(path)
        return f"Removed: {path}"