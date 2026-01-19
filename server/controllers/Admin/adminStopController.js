const Stop = require('../../models/Stop');

const createStop = async(req,res)=>{
    try {
        const {name,lat,lng} =req.body
        if(!name || !lat || !lng){
            return res.status(400).json({success:false,message:"All fields are required"})
        }
        const stop = await Stop.create({
            name,
            location:{
                type:"Point",
                coordinates:[lat,lng]
            }
        })
        return res.status(201).json({success:true,data:stop})
    } catch (error) {
        res.status(500).json({success:false,message:error.message})   
    }
}

const getAllStops = async(req,res)=>{
    try {
        const stops = await Stop.find().sort({createdAt:-1})
        res.status(200).json({success:true,data:stops})
    } catch (error) {
        res.status(500).json({success:false,message:error.message})
    }
}

const updateStop = async(req,res)=>{
    try {
        const {stopId} = req.params;
        const {name,lat,lng} = req.body;

        const update = {}
        if(name) update.name = name;
        if(lat !=null && lng!=null){
            update.location = {
                type:"Point",
                coordinates:[lng,lat]
        }
    }

    const stop = await Stop.findByIdAndUpdate(stopId,update,{new:true})
    if(!stop){
        return res.status(404).json({success:false,message:"Stop not found"})
    }
    res.status(200).json({success:true,data:stop})
        
    } catch (error) {
        res.status(500).json({success:false,message:error.message})
    }
}

const toggleStopStatus = async(req,res)=>{
    try {
        const {stopId} = req.params;
        const stop = await Stop.findById(stopId);
        if(!stop){
            return res.status(404).json({success:false,message:"Stop not found"})
        }
        stop.isActive = !stop.isActive;
        await stop.save();
          res.json({
            success: true,
            message: `Stop ${stop.isActive ? "enabled" : "disabled"}`,
          });
    } catch (error) {
        res.status(500).json({success:false,message:error.message})
    }
}

module.exports = {
    createStop,
    getAllStops,
    updateStop,
    toggleStopStatus
}