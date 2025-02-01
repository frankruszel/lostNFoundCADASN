const API_URL = `${process.env.REACT_APP_ECOWISE_API_URL}/Image`
// const API_URL = 'http://localhost:3000'
export const uploadPhoto = (body) => {
    fetch(API_URL, {
        method: 'POST',
        body,
    })
}