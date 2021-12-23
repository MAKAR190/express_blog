const yup = require('yup')

exports.create = yup.object().shape({
    username: yup.string().required(),
    password: yup.string().required(),
    firstName: yup.string().required(),
    lastName: yup.string().required(),
    location: yup.string().optional(),
    avatarUrl: yup.string().url().optional(),
    githubUrl: yup.string().url().optional(),
    description: yup.string().optional(),
    work: yup.string().optional(),
    hobby: yup.string().optional(),
    birthDate: yup.date().optional(),
    following: yup.array(),
    followers: yup.array(),
    readingList: yup.array(),
    likedPosts: yup.array(),
    likedComments: yup.array(),
    posts: yup.array(),
})
exports.login = yup.object().shape({
    username: yup.string().required(),
    password: yup.string().required(),
})

exports.update = yup.object().shape({
    username: yup.string().required(),
    password: yup.string().required(),
    firstName: yup.string().required(),
    lastName: yup.string().required(),
    location: yup.string().optional(),
    avatarUrl: yup.string().url().optional(),
    githubUrl: yup.string().url().optional(),
    description: yup.string().optional(),
    work: yup.string().optional(),
    hobby: yup.string().optional(),
    birthDate: yup.date().optional(),
    following: yup.array(),
    followers: yup.array(),
    readingList: yup.array(),
    likedPosts: yup.array(),
    likedComments: yup.array(),
    posts: yup.array(),
})
