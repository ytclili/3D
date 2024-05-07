# deploy
echo "Deploy Project"

echo "Pulling latest changes from Git..."
git pull

echo "Removing all Docker containers and images..."
docker system prune --all --force

echo "Building Docker image my-page-3d..."
docker build --no-cache -t my-page-3d .

echo "Running Docker container my-page-3d..."
docker run -d -p 3000:80 my-page-3d