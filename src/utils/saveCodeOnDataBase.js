import { StatusCodes } from "http-status-codes";
import { Submission } from "../models/submission.model.js";

const saveCodeOnDataBase = async (problemId, language_id, code, user) => {
    try {
        // Check if the user already submitted for this problem
        let existingSubmission = await Submission.findOne({ userId:user._id, problemId });

        if (existingSubmission) {
            // If exists, update the existing submission
            existingSubmission.code = code;
            existingSubmission.language = language;
            existingSubmission.updatedAt = Date.now();
            await existingSubmission.save();
            return existingSubmission;
        } else {
            // If not exists, create a new submission
            const newSubmission = new Submission({
                userId: user._id,
                problemId,
                language_id,
                code,
            });

            await newSubmission.save();
            return newSubmission;
        }
    } catch (error) {
        return null;
    }
}

export { saveCodeOnDataBase }