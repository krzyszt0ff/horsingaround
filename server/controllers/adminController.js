import { UserCredentials } from "../models/UserCredentials.js"; 
import { Report } from "../models/Report.js";
import { UserData } from "../models/UserData.js";

export async function listReports(req, res){
 try {
    const reports = await Report.find().populate("user_id", "email role");
    res.status(200).json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }

};

export async function getReport(req, res){
     try {
    const report = await Report.findById(req.params.id)
      .populate("user_id", "email role");

    if (!report)
      return res.status(404).json({ message: "Report not found" });

    res.status(200).json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export async function changeReportStatus(req, res){
try {
    const { status } = req.body;

    const updated = await Report.findByIdAndUpdate(
      req.params.id,
      { status },
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
export async function listUsers(req, res){
try{

    const users=await UserCredentials.find({},"email role");
     res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }


};

export async function changeUserRole(req, res){
 try {
    const { role } = req.body;

    const user = await UserCredentials.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }

};
