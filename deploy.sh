# deploy
echo Deploy Project

git pull

docker build -t my-page-3d .
docker run -d -p 3000:80 my-page-3d