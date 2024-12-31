const express = require("express");
const mongoose = require('mongoose');
const router = express.Router();

// 連接到 MongoDB 資料庫
mongoose.connect('mongodb+srv://weilin50167:GXAL1OP232rhBZiX@cluster0.t1uxr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Connection fails!'));

db.once('open', function () {
    console.log('Connected to database...');    
});

// 更新 commentSchema，增加 rating 欄位
const commentSchema = new mongoose.Schema({
    thing: { // 事項名稱
        type: String, // 設定該欄位的格式
        required: true // 設定該欄位是否必填
    },

    rating: { // 評分
        type: Number, // 設定評分為數字
        required: true, // 設定該欄位為必填
        min: 1, // 設定最小值
        max: 10 // 設定最大值
    },

    createdDate: { // 新增的時間
        type: Date,
        default: Date.now,
        required: true
    },
});

const Comment = mongoose.model('Comment', commentSchema);

// 取得所有建議
router.get("/", async (req, res) => {
    try {
        const comment = await Comment.find();
        res.json(comment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 新增建議與評分
router.post("/", async (req, res) => {
    const comment = new Comment({
        thing: req.body.thing,
        rating: req.body.rating, // 接收評分
    });

    try {
        const newComment = await comment.save();
        res.status(201).json(newComment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// 取得單一建議
router.get("/:id", async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ message: "Can't find comment" });
        }
        return res.status(200).json(comment);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

// 更新建議
router.put("/:id", async (req, res) => {
    try {
        const updatedComment = await Comment.findByIdAndUpdate(
            req.params.id,
            {
                thing: req.body.thing,
                rating: req.body.rating, // 更新評分
            },
            { new: true }
        );
        res.json(updatedComment);
    } catch (err) {
        res.status(500).json({ message: "Update comment failed!" });
    }
});

// 刪除建議
router.delete("/:id", async (req, res) => {
    try {
        await Comment.findByIdAndDelete(req.params.id);
        res.json({ message: "Delete comment successfully!" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Remove comment failed!" });
    }
});

// Export 該Router
module.exports = router;