# Deployment Plan - Track A (EC2 + RDS MySQL)

Panduan langkah di AWS (us-east-1). Catat nama/ID resource dan ambil screenshot di tiap langkah bertanda **[BUKTI]** (simpan ke folder `evidence/`).


## 1. Network (VPC)
VPC -> Create VPC -> "VPC and more": name `loan`, `10.0.0.0/16`, 2 AZ, public subnet, 2 private subnet, NAT gateway None, VPC endpoints None.

## 2. Security group (di loan-vpc)
1. `loan-app-sg`: SSH 22 dari My IP; Custom TCP 3000 dari `0.0.0.0/0`.
2. `loan-db-sg`: MySQL/Aurora 3306 dari `loan-app-sg` (pilih security group, bukan IP).

## 3. RDS MySQL
- DB subnet group `loan-db-subnet`: dua subnet private (us-east-1a dan 1b).
- MySQL 8.0, Single-AZ, id `loan-db`, user `admin`, `db.t3.micro`, 20 GB, VPC `loan-vpc`, **Public access: No**, SG `loan-db-sg`, initial database `loan_db`.

## 4. EC2
- `loan-app`, Amazon Linux 2023, `t3.micro`, key pair `loan-key` (.pem), VPC `loan-vpc`, public subnet us-east-1a, auto-assign public IP, SG `loan-app-sg`, tanpa IAM role.

## 5. Pasang aplikasi (SSH)
```bash
ssh -i loan-key.pem ec2-user@<EC2_PUBLIC_IP>
sudo dnf update -y
sudo dnf install -y nodejs git mariadb105
git clone https://github.com/RAKASAMUD/camera-loan-api.git && cd camera-loan-api
npm install
cp .env.example .env && nano .env     # DB_HOST = endpoint RDS, DB_USER, DB_PASSWORD
mysql -h <endpoint-rds> -u admin -p < sql/schema.sql
npm run check-db
npm start
```

## 6. Uji dari laptop
```bash
curl http://<EC2_PUBLIC_IP>:3000/health
curl -X POST http://<EC2_PUBLIC_IP>:3000/loans -H "Content-Type: application/json" \
  -d '{"camera_name":"Canon EOS 200D","borrower_name":"Budi","loan_date":"2026-11-24","due_date":"2026-11-27"}'
curl http://<EC2_PUBLIC_IP>:3000/loans
```

## 7. Setelah selesai
Stop atau hapus EC2 dan RDS agar tidak ada biaya.
