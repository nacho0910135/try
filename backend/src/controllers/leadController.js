import { leadService } from "../services/leadService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createLead = asyncHandler(async (req, res) => {
  const lead = await leadService.create(req.body, req.user);
  res.status(201).json({ success: true, lead });
});

export const listReceivedLeads = asyncHandler(async (req, res) => {
  const data = await leadService.listReceived(req.user, req.query);
  res.json({ success: true, ...data });
});

export const listSentLeads = asyncHandler(async (req, res) => {
  const data = await leadService.listSent(req.user, req.query);
  res.json({ success: true, ...data });
});

export const updateLeadStatus = asyncHandler(async (req, res) => {
  const lead = await leadService.updateStatus(req.params.leadId, req.user, req.body.status);
  res.json({ success: true, lead });
});

