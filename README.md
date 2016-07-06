# spritelist

read dir images width and height and list them for css sprites!

## install

必须安装在全局：`npm i -g spritelist`

##usage

```shell
spritelist
```

直接扫描当前文件夹的图片文件，打开127.0.0.1:9090地址，生成sprites less样式；

```shell
spritelist <path>
```

扫描定义<path>文件夹下的图片文件：

```shell
spritelist -p
```

加上`-p`参数，则不生成文件，直接打印在console中；
加上`-f`参数，则不打印，而是生成sprites less样式的sprites.txt文件；
加上`-c`或`--css`参数，则生成的是css属性的样式表，需开发者自定义图片路径；

##应用于开发

默认生成的spritelist样式表样例为：

```less
.sprite-1{.sprite-item("1",".jpg",454,810);}
.sprite-2{.sprite-item("2",".jpg",607,810);}
.sprite-3{.sprite-item("3",".jpg",640,854);}
```

上面的样式表需基于以下的样式：

```less
/** 雪碧图配置 */
.sprite-item(@basename, @ext, @width, @height){
  background-image: url("../img/sprites/@{basename}@{ext}");
  width: @width*1px;
  height: @height*1px;
}

/** 前缀: sprite-。精灵图基本样式与各图层 */
.sprite-ico{display:block; border:none; background-color:transparent; background-repeat:no-repeat;}
```

开发时，在HTML则非常方便就写出UI级的图标了：

```html
<i class="sprite-ico sprite-1"></i>
<i class="sprite-ico sprite-2"></i>
```

这样写的好处是：

1. 把雪碧图抽象出来成为UI级的控件，使用起来极其方便
2. 把定义雪碧图的样式表抽象出来，方便结合其他雪碧图工具来替换
3. 保留了雪碧图的原图，添加、修改、删除都方便




