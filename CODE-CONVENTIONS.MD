# Code Conventions

This document defines the coding conventions used in this repository to ensure the codebase stays consistent, readable, and maintainable.

---

# 1. General Principles

- Write clear and readable code.
- Follow consistent naming conventions.
- Group related files together.
- Keep frontend and backend structures organized.
- Use consistent formatting and brace styles.

---

# 2. Brace Style

Functions and methods follow this format:

```js
methodName(){
}
```

Example:

```js
handleSubmit(){
}

calculateTotalHours(){
}
```

This style should be used consistently across the project.

---

# 3. Naming Conventions

## 3.1 camelCase

Used for:
- variables
- methods
- functions

camelCase means:
- first word starts lowercase
- each next word starts with uppercase
- no spaces

Examples:

```js
userName
projectStartDate
calculateTotalHours
handleLogin
```

Example in code:

```js
handleLogin(){
}

calculateProjectHours(){
}
```

---

## 3.2 PascalCase

Used for:
- React components
- JSX file names
- Page folders
- Component folders

PascalCase means:
- every word starts with uppercase
- no spaces

Examples:

```
NavBar
HomePage
ProjectCard
DashboardPage
```

Example:

```
Pages/Home/Home.jsx
Components/NavBar/NavBar.jsx
```

---

## 3.3 kebab-case

Used for:
- CSS `className` values in React

kebab-case means:
- lowercase letters
- words separated by hyphens

Examples:

```html
nav-bar
nav-links
github-logo
home-container
project-card
```

Example in React:

```jsx
<nav className="nav-bar">
<div className="nav-links"></div>
<div className="github-logo"></div>
```

---

# 4. Frontend Folder Structure

Frontend is separated into **Pages** and **Components**.

---

# 4.1 Pages

Inside the `Pages` folder, every page has its own folder.

That folder contains:

- the JSX file
- the CSS file

Structure:

```
Pages/
├── Home/
│   ├── Home.jsx
│   └── home.css
├── About/
│   ├── About.jsx
│   └── about.css
├── Contact/
│   ├── Contact.jsx
│   └── contact.css
```

### Rules

Page folder names → **PascalCase**

```
Home
About
ProjectOverview
```

JSX file names → **PascalCase**

```
Home.jsx
About.jsx
ProjectOverview.jsx
```

CSS file names → **plain lowercase**

```
home.css
about.css
navbar.css
footer.css
```

---

# 4.2 Components

Components follow the same structure as pages.

Structure:

```
Components/
├── NavBar/
│   ├── NavBar.jsx
│   └── navbar.css
├── Footer/
│   ├── Footer.jsx
│   └── footer.css
├── ProjectCard/
│   ├── ProjectCard.jsx
│   └── projectcard.css
```

### Rules

Component folder → **PascalCase**

```
NavBar
Footer
ProjectCard
```

Component JSX file → **PascalCase**

```
NavBar.jsx
Footer.jsx
ProjectCard.jsx
```

Component CSS file → **plain lowercase**

```
navbar.css
footer.css
projectcard.css
```

---

# 5. CSS className Conventions

When writing CSS selectors and `className` in React, we use **kebab-case**.

Correct examples:

```jsx
<nav className="nav-bar"></nav>

<div className="nav-links"></div>

<div className="github-logo"></div>

<section className="home-container"></section>
```

Incorrect examples:

```jsx
<nav className="NavBar"></nav>

<div className="navLinks"></div>

<div className="github_logo"></div>
```

Rule:

Use

```
lowercase
hyphens between words
```

Do NOT use

```
camelCase
underscores
PascalCase
spaces
```

---

# 6. React Component Example

Example of a correctly structured component:

```jsx
import "./navbar.css";

function NavBar(){
    return (
        <nav className="nav-bar">
            <div className="nav-links">
                <a href="/">Home</a>
                <a href="/about">About</a>
            </div>
        </nav>
    );
}

export default NavBar;
```

---

# 7. Backend Structure (TypeORM)

For the backend we use **TypeORM**.

Each database table must have its own folder.

Example:

```
account/
```

Inside that folder we include:

```
account/
├── dto-account/
│   ├── create-account.dto.ts
│   ├── update-account.dto.ts
├── account.controller.ts
├── account.service.ts
├── account.module.ts
├── account.entity.ts
```

---

# 8. DTO Naming

DTO folders:

```
dto-account
dto-user
dto-project
```

DTO files:

```
create-account.dto.ts
update-account.dto.ts
delete-account.dto.ts
```

Rules:

- DTO folder names → lowercase with hyphens
- DTO files → lowercase with hyphens
- DTO names must clearly describe the purpose

Correct examples:

```
create-account.dto.ts
update-project.dto.ts
create-user.dto.ts
```

Incorrect examples:

```
CreateAccountDto.ts
createAccount.dto.ts
AccountDTO.ts
```

Usage example

```ts

    createAccount(createAccountDto: CreateAccountDto){

        const email = createAccountDto.email;
        const password = createAccountDto.password;
        const username = createAccountDto.username;

        // logic to create account

    }
```

---

# 9. Backend Method Naming

Backend methods follow **camelCase**.

Examples:

```ts
createAccount(){
}

login(){
}

updateAccount(){
}

deleteAccount(){
}

getAllAccounts(){
}
```

Example inside a service:

```ts
createAccount(){
}

findAllAccounts(){
}

findAccountById(){
}

updateAccount(){
}
```

---

# 10. Summary

### Frontend

| Item | Convention | Example |
|-----|-----|-----|
| Page folder | PascalCase | `Home` |
| Page JSX | PascalCase | `Home.jsx` |
| Page CSS | lowercase | `home.css` |
| Component folder | PascalCase | `NavBar` |
| Component JSX | PascalCase | `NavBar.jsx` |
| Component CSS | lowercase | `navbar.css` |
| CSS className | kebab-case | `nav-bar` |

---

### Backend

| Item | Convention | Example |
|-----|-----|-----|
| Entity folder | lowercase | `account` |
| DTO folder | kebab-case | `dto-account` |
| DTO file | kebab-case | `create-account.dto.ts` |
| Methods | camelCase | `createAccount()` |

---

# 11. Final Rule

Always follow the conventions described above to keep the project consistent and easy to maintain.