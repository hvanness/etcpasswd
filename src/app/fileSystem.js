import blog from './blog.txt'
import normalizePath from 'normalize-path'
import EtcPasswd from './EtcPasswd'

class FileSystem {
  fileSystem = {
    "~": {
      "Projects": {
        "personal": {
          "blog.txt": blog,
        }
      }
    },
    "/": {
      "etc": {
        "passwd": EtcPasswd
      }
    }
  }

  readFile = (workingDirectory, path) => {
    return (
      normalizePath(path ? (
          (path[0] == '/' || path[0] == '~') ? path
          : workingDirectory+'/'+path
        )
        : workingDirectory
      )
    )
    .split("/")
    .filter(x => x.length)
    .reduce(
      (file, fileName) => {
        return file ? file[fileName] : file
      },
      (workingDirectory[0] == "/" || (path && path[0] == "/")) ? this.fileSystem["/"] : this.fileSystem,
    )
  }

  ls = (workingDirectory, fileNames) => (
    (fileNames && fileNames.length) ? (
      fileNames.map((fileName) => (
        Object.keys(
          this.readFile(workingDirectory, fileName)
          || {["ls: "+fileName+": No such file or directory"]: true}
        )
      ))
    )
    : (
      Object.keys(this.readFile(workingDirectory) || {})
    )
  )

  join = (a,b) => normalizePath(a+'/'+b)

  suggestion = (workingDirectory, input) => {
    const partial = input.split('/').slice(-1)[0]
    const directory = input.substr(0, input.length - partial.length)
    const result = (
      this.ls((directory[0] == '/' || directory[0] == '~') ? directory : workingDirectory + '/'+directory)
      .find(name => name.startsWith(partial))
    )

    return result && (directory + result)
  }
}

export default (new FileSystem())
