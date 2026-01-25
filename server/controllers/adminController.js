import { UserCredentials } from "../models/UserCredentials.js"; 
import { Report } from "../models/Report.js";
import { UserData } from "../models/UserData.js";

export async function listReports(req, res) {
  try {
    const reports = await Report.find()
      .populate({ path: "reporter_id", model: "UserCredentials", select: "email role" })
      .populate({ path: "reported_user_id", model: "UserCredentials", select: "email role" });

    res.status(200).json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getReport(req, res) {
  try {
    const report = await Report.findById(req.params.id)
      .populate({ path: "reporter_id", model: "UserCredentials", select: "email role" })
      .populate({ path: "reported_user_id", model: "UserCredentials", select: "email role" });

    if (!report) return res.status(404).json({ message: "Report not found" });

    res.status(200).json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function changeReportStatus(req, res){
try {
    const { inspected } = req.body;

    const updated = await Report.findByIdAndUpdate(
      req.params.id,
      { inspected: !!inspected  },
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ message: "Report not found" });

    res.status(200).json(updated);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
//funckja pobiera liste wszystkich uzytkownkow z bazy danych i zwraca pola email role a jesli jest problem to jest problem i wywala blad 500
export async function listUsers(req, res) {
  try {
    const includeDeleted = req.query.includeDeleted === "true";

    const filter = includeDeleted
      ? {}
      : { isDeleted: { $ne: true } };

    const users = await UserCredentials
      .find(filter)
      .select("email role isDeleted"); // ✅ żeby Vue widziało status

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};




export async function changeUserRole(req, res) {
  try {
    const { role } = req.body;

    const user = await UserCredentials.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("email role isDeleted"); // ✅ bez password_hash

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
;
export async function softDeleteUser(req, res) {
  try {
    const userId = req.params.id;

    const user = await UserCredentials.findByIdAndUpdate(
      userId,
      {
        isDeleted: true
      },
      { new: true }
    ).select("email role isDeleted");

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ success: true, message: "User soft-deleted", user });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export async function restoreUser(req, res) {
  try {
    const userId = req.params.id;

    const user = await UserCredentials.findByIdAndUpdate(
      userId,
      { isDeleted: false},
      { new: true }
    ).select("email role isDeleted");

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ success: true, message: "User restored", user });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};