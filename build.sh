set -o errexist
pip insall -r requirements.txt

python manage.py collectstatics --no-input
python manage.py migrate