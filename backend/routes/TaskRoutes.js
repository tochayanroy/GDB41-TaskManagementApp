const express = require("express");
const router = express.Router();
const Task = require("../modules/TaskSchema");
const passport = require("passport");


router.post("/createTask", passport.authenticate("jwt", { session: false }), async (req, res) => {
	try {
		const { title, description, dueDate, status, priority } = req.body;
		console.log(req.body);

		const newTask = new Task({
			createdBy: req.user._id,
			title,
			description,
			dueDate,
			status,
			priority,
		});

		const savedTask = await newTask.save();
		res.status(201).json(savedTask);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
}
);


router.get("/getAllTask", passport.authenticate("jwt", { session: false }), async (req, res) => {
	try {
		const tasks = await Task.find({ createdBy: req.user._id }).sort({
			createdDate: -1,
		});
		
		res.json(tasks);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
}
);


router.get("/getTaskById/:id", passport.authenticate("jwt", { session: false }), async (req, res) => {
	try {
		const task = await Task.findOne({
			_id: req.params.id,
			createdBy: req.user._id,
		});

		if (!task) return res.status(404).json({ msg: "Task not found" });

		res.json(task);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
}
);


router.put("/updateTask/:id", passport.authenticate("jwt", { session: false }), async (req, res) => {
	try {
		const { title, description, dueDate, status, priority } = req.body;

		let task = await Task.findOne({ _id: req.params.id, createdBy: req.user._id });

		if (!task) return res.status(404).json({ msg: "Task not found" });

		task.title = title || task.title;
		task.description = description || task.description;
		task.dueDate = dueDate || task.dueDate;
		task.status = status || task.status;
		task.priority = priority || task.priority;

		const updatedTask = await task.save();
		res.json(updatedTask);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
}
);


router.delete("/deleteTask/:id", passport.authenticate("jwt", { session: false }), async (req, res) => {
	try {
		const task = await Task.findOneAndDelete({
			_id: req.params.id,
			createdBy: req.user._id,
		});

		if (!task) return res.status(404).json({ msg: "Task not found" });

		res.json({ msg: "Task deleted successfully" });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
}
);

module.exports = router;
