SSH into EC2 Intance:
ssh -i "C:\Users\ediso\Downloads\RSA_Key.pem" ec2-user@ec2-3-144-173-251.us-east-2.compute.amazonaws.com

Activate Bot
screen -d -m npm start

Kill Bot
screen -ls 
screen -X -S [session to kill] quit