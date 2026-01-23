
import { Firestore, collection, doc, writeBatch } from "firebase/firestore";
import { User, Host, Experience, Review, Report, HostApplication } from "./types";
import { mockUsers, mockHosts, mockExperiences, mockReviews, mockReports, mockHostApplications } from "./mock-data";

export async function seedDatabase(db: Firestore) {
  const batch = writeBatch(db);

  // Seed Users
  mockUsers.forEach((user: User) => {
    const docRef = doc(db, "users", user.id);
    batch.set(docRef, { ...user, createdAt: new Date(user.createdAt), updatedAt: new Date(user.updatedAt) });
  });

  // Seed Hosts
  mockHosts.forEach((host: Host) => {
    const docRef = doc(db, "users", host.userId, "hosts", host.id);
    batch.set(docRef, { ...host, createdAt: new Date(host.createdAt) });
  });

  // Seed Experiences
  mockExperiences.forEach((exp: Experience) => {
    const docRef = doc(db, "experiences", exp.id);
    batch.set(docRef, { ...exp, createdAt: new Date(exp.createdAt) });
  });

  // Seed Reviews
  mockReviews.forEach((review: Review) => {
    const docRef = doc(db, "reviews", review.id);
    batch.set(docRef, { ...review, createdAt: new Date(review.createdAt) });
  });

  // Seed Reports
  mockReports.forEach((report: Report) => {
    const docRef = doc(db, "reports", report.id);
    batch.set(docRef, { ...report, date: new Date(report.date) });
  });

  // Seed Host Applications
  mockHostApplications.forEach((app: HostApplication) => {
    const docRef = doc(db, "hostApplications", app.id);
    batch.set(docRef, { ...app, submittedDate: new Date(app.submittedDate) });
  });

  await batch.commit();
}
