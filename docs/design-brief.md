---
title: "Design Brief - Camera Loan API (AWS Track A)"
---

**Nama:** Raka Bagus Samudra  **Mata kuliah:** Cloud Computing (AWS)  **Minggu:** 12  **Track:** A - Cloud VM (EC2 + RDS MySQL)  **Region:** us-east-1

## 1. Use case
Peminjaman kamera perlu dicatat dengan rapi: kamera apa yang dipinjam, oleh siapa, kapan dipinjam, batas pengembalian, dan apakah sudah dikembalikan. Pencatatan manual rawan hilang dan sulit dicari. Aplikasi ini berupa REST API sederhana yang bisa dipakai frontend atau petugas lewat HTTP.

## 2. Track dan alasan
Track A dipilih karena memetakan langsung ke tiga konsep inti kuliah: provisioning VM (EC2), jaringan terisolasi (VPC, subnet, security group), dan database terkelola (RDS). Server aplikasi dan database dipisah agar data aman dan tiap komponen bisa dikelola sendiri.

## 3. Arsitektur
Lihat `docs/architecture.png`. Ringkasnya:

- **VPC `loan-vpc` (10.0.0.0/16)** dengan public subnet di us-east-1a (EC2) dan 2 private subnet di us-east-1a dan us-east-1b (RDS, syarat DB subnet group `loan-db-subnet`).
- **EC2 t3.micro** (Amazon Linux 2023) menjalankan Node.js + Express di port 3000.
- **RDS MySQL 8.4 (db.t3.micro)**, *publicly accessible = No*.
- **Internet Gateway** hanya untuk public subnet.

**Alur data:** Client -> IP publik EC2:3000 -> Express memvalidasi input -> query MySQL via mysql2 ke RDS (port 3306, jalur privat) -> respons JSON ke client.

**IAM dan keamanan:**

- EC2 dijalankan **tanpa IAM role** karena API hanya berbicara dengan RDS lewat koneksi MySQL, tidak memanggil API AWS lain (prinsip least privilege). Tidak ada access key di dalam kode. Akses admin ke server memakai key pair `loan-key`.
- `loan-app-sg`: inbound 22 hanya dari IP saya, 3000 dari internet.
- `loan-db-sg`: inbound 3306 **hanya dari `loan-app-sg`**.
- Kredensial DB disimpan di `.env` pada EC2 (tidak di-commit; ada di `.gitignore`).

## 4. Data entity: `loans`
`id` (PK), `camera_name`, `borrower_name`, `loan_date`, `due_date`, `status` (`BORROWED`/`RETURNED`).

## 5. Endpoint CRUD
| Operasi | Method dan path |
|---|---|
| Create | `POST /loans` |
| Read | `GET /loans`, `GET /loans/:id` |
| Update | `PUT /loans/:id` |
| Delete | `DELETE /loans/:id` |

Tambahan: `GET /health` untuk membuktikan koneksi aplikasi ke RDS.

## 6. Rencana deployment
1) Buat VPC, subnet, IGW, route table. 2) Buat security group. 3) Buat RDS di private subnet. 4) Luncurkan EC2, pasang Node.js, clone repo. 5) Isi `.env`, jalankan `schema.sql`, `npm run check-db`, lalu `npm start`. 6) Uji CRUD dengan curl. Detail: `docs/deployment-plan.md`.

## 7. Risiko
IP publik EC2 berubah jika instance di-stop lalu dijalankan lagi (belum memakai Elastic IP), dan IP admin di aturan SSH bisa berubah jika berganti jaringan. Biaya dijaga dengan instance kecil dan menghentikan EC2 dan RDS setelah pengujian.
