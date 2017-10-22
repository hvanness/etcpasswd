export default (workingDirectory, args, fs, handleChangeDirectory) => {
  if (args.length != 1) {
    return "usage: cd [directory]"
  }
  else {
    const path = (
      (args[0] == '.' || args[0] == './') ? (
        workingDirectory
      )
      : (args[0] == '..' || args[0] == '../') ? (
        workingDirectory == '~' ? '~'
        : (
          (workingDirectory.split('/').length == 2 && workingDirectory[0] == '/' ? '/' : '')
          + workingDirectory // /   ~/Projects
            .split('/')      // ['','']  [~,Projects]
            .slice(0,-1)     // ['']     [~]
            .join('/')       //  ''       ~
        )
      )
      : (
        ((args[0][0] != '/' && args[0][0] != '~') ? workingDirectory + (workingDirectory != '/' ? '/' : '')
        : '')
        + (
          args[0].length > 1 && args[0][args[0].length - 1] == '/' ? args[0].substr(0, args[0].length - 1)
          : args[0]
        )
      )
    )

    return (
      fs.readFile(path) ? handleChangeDirectory(path)
      : "-bash: cd: "+args[0]+": No such file or directory"
    )
  }
}
