# TaxiTap

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Project Description

<p align="center">
    <img src="assets/images/taxi.gif" height="100"/>
</p>

*TaxiTap* - is a mobile platform designed to revolutionise South Africa’s minibus taxi industry by digitising route information, eliminating the need for constant hooting, and creating a semi-structured booking system while preserving the flexibility that makes taxis an essential transport mode.
The system connects passengers and taxi operators through a location-aware mobile application that facilitates taxi requests, communicates passenger locations, manages payments, and provides real-time vehicle tracking – all without fundamentally changing the existing system's multi-passenger, flexible route nature.


## Team: Git It Done
<p align="center">
  <a href ="http://gititdone2025.site"><img src="assets/images/Logo_nobg.png" alt="Git It Done Logo" width="200"/></a>
</p>

## Technology Stack

### Frontend:
- **Expo (React Native with TypeScript)**  
  For cross-platform web and mobile development (Android + iOS).  
  Fast iteration with Expo Go. Supports native features like GPS, camera, push notifications, and QR scanning.

### Backend:
- **Convex (TypeScript Serverless Backend)**  
  Real-time reactive backend with built-in functions, scheduling, authentication, and automatic data syncing.  
  Supports business logic like ride requests, GPS updates, seat tracking, and notifications.

### Database:
- **Convex Document-Oriented Database**  
  Schema-defined collections (e.g. `users`, `rides`, `taxis`, `clusters`).  
  Supports relations via `v.id()` references and real-time subscriptions for live data updates.

### Hosting:
- **Convex Cloud (Managed)**  
  Backend and database are deployed to Convex’s cloud infrastructure.  
  No need for containers, VMs, or Kubernetes. Built-in CI/CD with `convex deploy`.

  Frontend hosted via:
  - **Expo Cloud** for over-the-air updates
  - **Play Store & App Store** for production builds

## Branching Strategy: `GitFlow`
- `main`: Production code
- `develop`: Development code
- `feature/*`: New features
- `hotfix/*`: Urgent fixes
- `release/*`: Release preparation

## Team Members & Roles

<table>
  <tr>
    <td>
      <img src="assets/images/annie.jpeg" height="80" width="80" alt="Ann-Marí Oberholzer"/>
      <p><b>Ann-Marí Oberholzer</b></p>
      <p>Project Manager</p>
      <a href="https://github.com/Ann-Mari-Oberholzer"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white" /></a>
      <a href="https://linkedin.com/ann-mari-oberholzer-967982354/"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" /></a>
    </td>
    <td>
      <img src="assets/images/unathi.jpeg" height="80" width="80" alt="Unathi Dlamini"/>
      <p><b>Unathi Dlamini</b></p>
      <p>Backend Engineer</p>
      <a href="https://github.com/un4thi"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white" /></a>
      <a href="https://linkedin.com/unathi-dlamini-237007224/"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" /></a>
    </td>
    <td>
      <img src="assets/images/tebogo.jpg" height="80" width="80" alt="Moyahabo Hamese"/>
      <p><b>Moyahabo Hamese</b></p>
      <p>Frontend Engineer</p>
      <a href="https://github.com/habohamese"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white" /></a>
      <a href="https://www.linkedin.com/in/moyahabo-hamese/"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" /></a>
    </td>
  </tr>
  <tr>
    <td>
      <img src="assets/images/ati.jpeg" height="80" width="80" alt="Atidaishe Mupanemunda"/>
      <p><b>Atidaishe Mupanemunda</b></p>
      <p>Backend Engineer</p>
      <a href="https://github.com/WillyDoo428"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white" /></a>
      <a href="https://www.linkedin.com/in/atidaishe-mupanemunda-87ba721b7/"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" /></a>
    </td>
    <td>
      <img src="assets/images/nev.jpg" height="80" width="80" alt="Nevan Rahman"/>
      <p><b>Nevan Rahman</b></p>
      <p>Fullstack Engineer</p>
      <a href="https://github.com/rsnevan"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white" /></a>
      <a href="https://linkedin.com/in/nevanrahman"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" /></a>
    </td>
    <td></td>
  </tr>
</table>

## Features (Planned)
- Real-time taxi tracking
- Secure in-app payments
- Trip history and receipts
- Driver ratings and reviews

## Getting Started
Coming soon
