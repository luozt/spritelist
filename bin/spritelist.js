#!/usr/bin/env node

//插件类
var fs = require("fs"),
  path = require("path"),
  http = require("http"),
  sizeOf = require('image-size'),
  argv = require("minimist")(process.argv.slice(2));

// 全局函数
var workpath, arrRes = [];

// 工具类
var reImagePath = /^.+\.(jpg|jpeg|png|bmp|tiff|webp|svg)$/i;

var reUnderscore = /^_*([^_].+)$/i;

// 剔除文件名开头的下划线
var formateSpriteName = function(basename){
  if(reUnderscore.test(basename)){
    basename = RegExp.$1;
  }
  return basename;
}

// 配置
var makeItem = function(basename, ext, width, height) {
  var isCss = argv["c"] || argv["css"];
  var n = argv['n'] || '';
  if(!isCss){
    return [
      ".sprite"+n+"-", formateSpriteName(basename), "{",
      ".sprite"+n+"-item(\"", basename, "\",\"", ext, "\",", width, ",", height, ");",
      "}"
    ].join("");
  }else{
    return [
      ".sprite"+n+"-", basename, "{",
      "width:", width, "px; ",
      "height:",height,"px; ",
      "background-image:url(",basename,ext,");",
      "}"
    ].join("");
  }
};

//定义输出结果
var outputRes = function(arrRes) {
  var isPrint = argv["p"];
  var isFile = argv["f"];

  if (isPrint) {
    console.log(arrRes.join("\n"));
  }

  else if (isFile) {
    var ws = fs.createWriteStream("spritelist.txt");
    var write = function(i) {
      ws.write(arrRes[i] + "\n", function(err) {
        if (err) {
          return console.log(err);
        }

        i++;

        if (i < arrRes.length) {
          write(i);
        } else {
          console.log("spritelist finished!");
        }
      });
    };
    write(0);
  }

  else {
    var IS_WIN = process.platform.indexOf('win') === 0;
    var escapeShellArg = function(cmd) {
      return '"' + cmd + '"';
    };
    var openUrl = function(path, callback){
      var child_process = require("child_process");
      var cmd = escapeShellArg(path);
      if(IS_WIN){
        cmd = 'start "" ' + cmd;
      }else{
        if(process.env["XDG_SESSION_COOKIE"] ||
           process.env["XDG_CONFIG_DIRS"] ||
           process.env["XDG_CURRENT_DESKTOP"]){
          cmd = "xdg-open " + cmd
        }else if(process.env["GNOME_DESKTOP_SESSION_ID"]){
          cmd = 'gnome-open ' + cmd;
        }else{
          cmd = "open " + cmd;
        }
      }
      child_process.exec(cmd, callback);
    };

    var server = http.createServer(function(request, response) {
      try {
        response.end(arrRes.join("\n"));
      } catch (err) {
        response.end(err.toString());
      }finally{
        process.exit()
      }
    });

    server.listen(9009);

    openUrl("http://127.0.0.1:9009", function(err){
      if(err){
        server.close();
        return console.log(err);
      }
    });

  }
};

// 分析用户定义的路径
if (argv["_"] && argv["_"][0]) {
  workpath = argv["_"][0];
} else {
  workpath = process.cwd();
}

//扫描目标工作路径
fs.readdir(workpath, function(err, files) {
  if (err) {
    return console.log(err);
  }

  if (!files || !files.length) {
    return console.log("No files in path:" + workpath);
  }

  file(0);

  // 处理文件
  function file(i) {
    var filename = files[i],
      ext = path.extname(filename),
      basename = path.basename(filename, ext),
      fullPath = workpath + "/" + filename,
      size;

    if (reImagePath.test(fullPath)) {
      fs.stat(fullPath, function(err, stat) {
        if (err) {
          return console.log(err);
        }

        if (!stat.isDirectory()) {
          // Synchronous sizeof
          size = sizeOf(fullPath);
          arrRes.push(makeItem(basename, ext, size.width, size.height));
        }

        i++;

        if (i === files.length) {
          outputRes(arrRes);
        } else {
          file(i);
        }
      });
    } else {
      i++;

      if (i === files.length) {
        outputRes(arrRes);
      } else {
        file(i);
      }
    }
  }
});
