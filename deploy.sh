# deploy
echo "Deploy Project"

echo "Pulling latest changes from Git..."
git pull
wait # 等待上一个命令完成
echo "pulling is complete ==========>>>>>>>>>>"
echo "Removing all Docker containers and images..."

# 停止上一次的container
docker stop my-page-3d
# docker rm $(docker ps -aq --filter "name=my-page-3d") || true
# 删除images
docker rm my-page-3d

docker system prune --all --force

echo "Building Docker image my-page-3d..."
docker build --no-cache -t my-page-3d .

echo "Running Docker container my-page-3d..."
docker run -d -p 3000:80 --name my-page-3d my-page-3d
