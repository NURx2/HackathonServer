exports.validateRegistrationUserData = (login, password, name, surname, userType) => {
    if (userType !== 'user' && userType !== 'artist') return 'User type has to be artist or user'
    if (password === undefined || login === undefined || name === undefined || surname === undefined) return 'One field is empty'
    if (password.length < 6) return 'Your password is too easy'
    return undefined
}