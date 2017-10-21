import blog from './blog.txt'
import normalizePath from 'normalize-path'

class FileSystem {
  fileSystem = {
    "~": {
      "Projects": {
        "personal": {
          "blog.txt": blog,
        }
      }
    }
  }

  readFile = (path) =>
    path
    .split("/")
    .reduce(
      (file, fileName) => file ? file[fileName] : file,
      this.fileSystem
    )

  ls = (workingDirectory, fileNames) => (
    fileNames.length
    ? (
      fileNames.map((fileName) => (
        Object.keys(
          this.readFile(
            normalizePath(
              (fileName[0] == '/' || fileName[0] == '~')
              ? fileName
              : workingDirectory+'/'+fileName
            )
          )
          || {["ls: "+fileName+": No such file or directory"]: true}
        )
      ))
    )
    : (
      Object.keys(this.readFile(workingDirectory))
    )
  )

  join = (a,b) => normalizePath(a+'/'+b)
}

export default (new FileSystem())
