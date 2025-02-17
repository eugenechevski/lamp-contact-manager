# LAMP Contact Manager

Linux, Apache, MariaDB, PHP

## Features

From the front page, 
- support user logins 
- account creation

Once logged in, 
- users can create, update, retrieve and delete contacts.
- Contacts must have at least names and e-mails.

## Deployment

* The application is deployed to AWS Lightsail.
* The deployment is triggered by pushing to the `main` branch.
* The deployment is done using the `deploy.yml` workflow.