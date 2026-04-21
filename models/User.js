
const Users = (req, res) => {
    const{username, email, number} = req.body
    if(!username || !email || !number){
        return res.status(400).json({error:'Wrong credentials'})
    }

    return res.status(200).json({message: `${username}, you've registered successfully`})
}




module.exports = Users

