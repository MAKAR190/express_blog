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
    birthDate: yup.date().optional()
})
exports.login = yup.object().shape({
    username: yup.string().required(),
    password: yup.string().required()
})

exports.update = yup.object().shape({
    firstName: yup.string().required(),
    lastName: yup.string().required(),
    location: yup.string().optional(),
    avatarUrl: yup.string().url().optional(),
    githubUrl: yup.string().url().optional(),
    description: yup.string().optional(),
    work: yup.string().optional(),
    hobby: yup.string().optional(),
    birthDate: yup.date().optional()
})
