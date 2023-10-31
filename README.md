
# Blog API NodeJS
## Tech Stack
Server: Node, Express, Mongoose, JWT, Google OAuth2, Cloudinary, Nodemailer, Socket.io




## API Features

- Authentication & Authorization
- Verify user account
- Forgot & Reset Password
- CRUD operations
- Admin can block users
- A user can follow and unfollow another user
- User can comment and like the post
- User pulls notifications
- Users can message inside private group
- Upload & Update profile photo
- Save post to bookmark
- Searching post & user


## End Points

 - [API Authentication](#Authentication)
 - [API Reference](#api-Reference)
    - [Auth API](#Auth-API)
        - [User signup](#User-signup)
        - [User login](#User-login)
        - [Google login](#Google-login)
        - [Get OTP](#Get-OTP-to-verify-account)
        - [Verify OTP](#Verify-OTP)
        - [Forgot password](#User-forgot-password)
        - [Reset password](#User-reset-password)
        - [Refesh access token](#Refesh-access-token)
    - [User API](#User-API)
        - [Update profile](#User-update-profile)
        - [Follow user](#follow-user)
        - [Unfollow user](#Unfollow-user)
        - [Searching](#User-searching)
        - [Admin gets all](#Admin-gets-all-users)
        - [Admin bans](#Admin-bans-user)
    - [Post API](#Post-API)
        - [Create post](#Create-post)
        - [Update post](#Update-post)
        - [Delete post](#Delete-post)
        - [Like post](#Like-post)
        - [Get post](#Get-post-by-id)
    - [Comment API](#Comment-API)
        - [Create Comment](#Create-comment)
        - [Create Reply Comment](#Create-reply-comment)
        - [Update comment](#Update-comment)
        - [Like comment](#Like-comment)
        - [Delete comment](#Delete-comment)
    - [Bookmark API](#Bookmark-API)
        - [Get bookmarks](#Get-bookmarks)
        - [Create bookmark](#Create-bookmark)
        - [Add post to bookmark](#Add-post-to-bookmark)
        - [Remove post from bookmark](#Remove-post-from-bookmark)
        - [Delete bookmark](#Delete-bookmark)
    - [Notification API](#Notification-API)
        - [Get user notifications](#Get-user-notifications)
        - [Delete user notifications](#Delete-user-notifications)
    - [Chat Group API](#Chat-Group-API)
        - [Create chat group](#Create-chat-group)
        - [Get user groups](#Get-user-groups)
        - [Get user group by id](#Get-user-group-by-id)
        - [Update user group](#Update-user-group)
        - [Create message](#Create-message)
        - [Get group messages](#Get-group-messages)
        - [Set seen messages](#Set-seen-messages)




## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`DB_URL`, `DB_PASSWORD`, `NODE_ENV` default `NODE_ENV=development`, `JWT_SECRET`, `HOST_EMAIL`, `PORT_EMAIL`, `USER_EMAIL`, `PASSWORD_EMAIL`, `EMAIL_FROM`, `JWT_COOKIE_EXPIRES_IN`, `REFESH_EXPIRES_IN`, `ACCESS_EXPIRES_IN`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_CLOUD_API_SECRET_KEY`, `CLOUDINARY_CLOUD_API_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`


## Authentication

Some endpoints may require authentication for example. To create a create/delete/update post, you need to register your API client and obtain an access token.

The endpoints that require authentication expect a bearer token sent in the `Authorization header`

Example:

`Authorization: Bearer YOUR TOKEN`




## API Reference

### Auth API

#### User signup

```http
  POST /api/v1/users/register
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `username` | `string` | **Required** |
| `email` | `string` | **Required** |
| `password` | `string` | **Required** |
| `passwordConfirm` | `string` | **Required** |

#### User login

```http
  POST /api/v1/users/login
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `email`      | `string` | **Required**|
| `password`      | `string` | **Required**|
| `passwordConfirm`      | `string` | **Required**|

#### Google login

```http
  GET /api/auth/google
```

#### Get OTP to verify account

```http
  POST /api/v1/users/get-otp
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `email`      | `string` | **Required**|

OTP is valid for only 5 minutes

#### Verify OTP 

```http
  POST /api/v1/users/verify
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `otp`      | `string` | **Required**|

#### User forgot password

```http
  POST /api/v1/users/forgot-password
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `email`      | `string` | **Required**|

Password reset token is valid for only 10 minutes

#### User reset password

```http
  POST /api/v1/users/reset-password/:token
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `password`      | `string` | **Required**|
| `passwordConfirm`      | `string` | **Required**|

`token` can get from password reset token in email forgot password

#### Refesh access token

```http
  GET /api/v1/users/refesh-access-token
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `refeshToken`      | `string` | Get from cookies|

### User API

#### User update profile

```http
  PATCH /api/v1/users/update-me
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `authentication`      | `string` |**Required**. Bearer Token|
| `avatar`      | `file` | Upload single file|
| `username`      | `string` | **Not Required**|

This route is not for password & email updates

#### Follow user

```http
  PATCH /api/v1/users/follow
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `id`      | `string` | **Required**. This id of user who want to follow|

#### Unfollow user

```http
  PATCH /api/v1/users/unfollow
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `id`      | `string` | **Required**. This id of user who want to unfollow|

#### User searching

```http
  GET /api/v1/users/search?search=query_string
```

`query_string` has two options. If `query_string` starts with `#` meaning `%23` url encoding, this route for hashtag searching. Otherwise, this route for user searching.

Example hashtag searching:
```http
  GET /api/v1/users/search?search=%23node
```
This route searchs hashtags start with `node` such as: `#nodejs`, `#nodeapi`,...

Example username searching:
```http
  GET /api/v1/users/search?search=carlos
```
This route searchs username start with `carlos`

#### Admin gets all users

```http
  GET /api/v1/users
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `authentication`      | `string` |**Required**. Bearer Token, Admin account|

Query options:

- Filter:
```http
  GET /api/v1/users?field_name=name

  ex: GET /api/v1/users?username=carlos
```
Admin can filter query string with comparison query operatiors `$gt`, `$lt`, `$in`, ...
Example: `?age[gt]=8` age meaning is greater than 8

- Limit fields:
```http
  GET /api/v1/users?fields=field_name
  
  ex: GET /api/v1/users?fields=username,email
```
- Sort:
```http
  GET /api/v1/users?sort=field_name
  
  ex: GET /api/v1/users?sort=username
```
Users default sorted by ascending,
`sort=-username` sorted by descending

- Paginate:
```http
  GET /api/v1/users?page=page_num&limit=limit_record
  
  ex: GET /api/v1/users?page=1&limit=5
```

#### Admin bans user

```http
  PATCH /api/v1/users/ban
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `authentication`      | `string` |**Required**. Bearer Token, Admin account|
| `action`      | `string` |**Required**. Example: `ban`, `active`, `verify`|
| `user`      | `string` |**Required**|

### Post API

#### Create post

```http
  POST /api/v1/posts
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `authentication`      | `string` |**Required**. Bearer Token|
| `images`      | `file` |Upload images|
| `caption`      | `string` |**Required**|

Capion can contain hashtags

#### Update post

```http
  PATCH /api/v1/posts/:id
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `authentication`      | `string` |**Required**. Bearer Token|
| `images`      | `file` |Update images|
| `caption`      | `string` |New Caption|

#### Delete post

```http
  DELETE /api/v1/posts/:id
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `authentication`      | `string` |**Required**. Bearer Token|

#### Like post

```http
  PATCH /api/v1/posts/like/:id
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `authentication`      | `string` |**Required**. Bearer Token|

If post already liked by user. Access this route to unlike this `id` post

#### Get post by id

```http
  GET /api/v1/posts/like/:id
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `authentication`      | `string` |**Not Required**|


### Comment API

#### Create comment

```http
  POST /api/v1/comments
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `authentication`      | `string` |**Required**. Bearer Token|
| `comment`      | `string` |**Required**|
| `post`      | `string` |**Required**. Post id|

#### Create reply comment

```http
  POST /api/v1/comments
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `authentication`      | `string` |**Required**. Bearer Token|
| `comment`      | `string` |**Required**|
| `post`      | `string` |**Required**. Post id|
| `parent`      | `string` |**Required**. Parent comment id|

#### Update comment

```http
  PATCH /api/v1/comments/:id
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `authentication`      | `string` |**Required**. Bearer Token|
| `comment`      | `string` |**Required**|


#### Like comment

```http
  PATCH /api/v1/comments/like/:id
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `authentication`      | `string` |**Required**. Bearer Token|


#### Delete comment

```http
  DELETE /api/v1/comments/:id
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `authentication`      | `string` |**Required**. Bearer Token|

### Bookmark API

#### Get bookmarks

```http
  GET /api/v1/bookmarks
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `authentication`      | `string` |**Required**. Bearer Token|

#### Create bookmark

```http
  POST /api/v1/bookmarks
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `authentication`      | `string` |**Required**. Bearer Token|
| `name`      | `string` |**Required**|

#### Add post to bookmark

```http
  POST /api/v1/bookmarks/:id
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `authentication`      | `string` |**Required**. Bearer Token|
| `post`      | `string` |**Required**. Post id|

#### Remove post from bookmark

```http
  POST /api/v1/bookmarks/:id
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `authentication`      | `string` |**Required**. Bearer Token|
| `post`      | `string` |**Required**. Post id|

#### Delete bookmark

```http
  POST /api/v1/bookmarks/:id
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `authentication`      | `string` |**Required**. Bearer Token|


### Notification API

#### Get user notifications 

```http
  GET /api/v1/notifications
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `authentication`      | `string` |**Required**. Bearer Token|

#### Delete user notifications 

```http
  DELETE /api/v1/notifications/:id
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `authentication`      | `string` |**Required**. Bearer Token|

#### Admin control notifications


### Chat Group API

#### Create chat group

```http
  POST /api/v1/groups
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `authentication`      | `string` |**Required**. Bearer Token|
| `users`      | `array` |**Required**. Array user id|
| `groupType`      | `string` |Private or Public|

#### Get user groups  

```http
  GET /api/v1/groups
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `authentication`      | `string` |**Required**. Bearer Token|

#### Get user group by id  

```http
  GET /api/v1/groups/:id
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `authentication`      | `string` |**Required**. Bearer Token|

#### Update user group 

```http
  PATCH /api/v1/groups/:id
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `authentication`      | `string` |**Required**. Bearer Token|
| `users`      | `array` |Array user id|
| `groupType`      | `string` |Private or Public|

#### Create message 

```http
  POST /api/v1/groups/:id/messages
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `authentication`      | `string` |**Required**. Bearer Token|
| `message`      | `string` |**Required**|

#### Get group messages 

```http
  GET /api/v1/groups/:id/messages
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `authentication`      | `string` |**Required**. Bearer Token|

#### Set seen messages 

```http
  PATCH /api/v1/groups/:id/seen
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `authentication`      | `string` |**Required**. Bearer Token|



## 🔗 Links
[![facebook](https://img.shields.io/badge/facebook-Code?style=for-the-badge&logo=facebook&logoColor=white&color=blue)](https://www.facebook.com/profile.php?id=100034947971586)

[![github](https://img.shields.io/badge/github-Code?style=for-the-badge&logo=github&logoColor=white&color=black)](https://github.com/vmdt)

