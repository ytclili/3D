
# 使用官方的轻量级Nginx镜像作为基础镜像
FROM nginx:alpine
 
# 将HTML项目文件夹复制到容器中的Nginx服务器的根目录
COPY ./index.html /usr/share/nginx/html/
COPY ./audio /usr/share/nginx/html/audio
COPY ./images /usr/share/nginx/html/images
COPY ./jsm /usr/share/nginx/html/jsm
COPY ./libs /usr/share/nginx/html/libs
COPY ./models /usr/share/nginx/html/models
COPY ./shaders /usr/share/nginx/html/shaders
COPY ./index.css /usr/share/nginx/html/index.css
COPY ./three.module.js /usr/share/nginx/html/three.module.js
 
# 在容器启动时启动 nginx 服务器
CMD ["nginx", "-g", "daemon off;"]
# 暴露80端口供外部访问
EXPOSE 3000