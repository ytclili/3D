# deploy
echo Deploy Project

git pull

docker image prune

docker build --no-cache -t my-page-3d .
docker run -d -p 3000:80 my-page-3d