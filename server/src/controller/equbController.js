import equb from "../models/equb";


const createEqub = async (req, res) => {
    try {
        const { name, amount, duration, members, userId } = req.body
        if (!name || !amount || !duration || !members) {
            return res.json({ success: false, message: 'Missing details' })
        }
        if (!userId) {
            return res.json({ success: false, message: 'Please Login' })
        }
        const newEqub = new equb({
            name,
            amount,
            duration,
            members,
            admin: userId
        })
        await newEqub.save()
        return res.json({ success: true, equb: newEqub })
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}
const EditEqub = async (req, res) => {
    try {
        const { name, amount, duration, members, equbId } = req.body
        if (!name || !amount || !duration || !members) {
            return res.json({ success: false, message: 'Missing details' })
        }
        const equb = await equb.findById(equbId)
        if (!equb) {
            return res.json({ success: false, message: 'Equb not found' })
        }
        equb.name = name
        equb.amount = amount
        equb.duration = duration
        equb.members = members
        await equb.save()
        return res.json({ success: true, equb: equb })
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}
const deleteEqub = async (req, res) => {
    try {
        const { equbId, userId } = req.body
        if (!equbId) {
            return res.json({ success: false, message: 'Missing details' })
        }
        const equb = await equb.findById(equbId)
        if (!equb) {
            return res.json({ success: false, message: 'Equb not found' })
        }
        if (userId !== equb.admin) {
            return res.json({ success: false, message: 'You are not authorized to delete this equb' })
        }
        await equb.deleteOne()
        return res.json({ success: true, message: 'Equb deleted successfully' })
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}
const getEqub = async (req, res) => {
    try {
        const equb = await equb.find()
        return res.json({ success: true, equb: equb })
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}
const getEqubById = async (req, res) => {
    try {
        const equb = await equb.findById(req.params.id)
        return res.json({ success: true, equb: equb })
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}
const getEqubByUserId = async (req, res) => {
    try {
        const equb = await equb.find({ admin: req.params.id })
        return res.json({ success: true, equb: equb })
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}
const getEqubByMemberId = async (req, res) => {
    try {
        const equb = await equb.find({ members: req.params.id })
        return res.json({ success: true, equb: equb })
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}