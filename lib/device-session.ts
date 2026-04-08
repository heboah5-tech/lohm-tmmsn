"use client";

import { db } from "./firebase";
import { collection, doc, setDoc, deleteDoc, onSnapshot, serverTimestamp } from "firebase/firestore";

const SESSION_KEY = "admin_session_id";

export function getSessionId(): string {
  if (typeof sessionStorage === "undefined") return "";
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

export function parseUserAgent() {
  if (typeof navigator === "undefined") return { device: "unknown", browser: "Unknown", os: "Unknown" };

  const ua = navigator.userAgent;

  let device = "desktop";
  if (/iPad/i.test(ua)) {
    device = "tablet";
  } else if (/Mobi|Android|iPhone|iPod/i.test(ua)) {
    device = "mobile";
  }

  let browser = "Unknown";
  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/OPR|Opera/i.test(ua)) browser = "Opera";
  else if (/Chrome/i.test(ua)) browser = "Chrome";
  else if (/Firefox/i.test(ua)) browser = "Firefox";
  else if (/Safari/i.test(ua)) browser = "Safari";

  let os = "Unknown";
  if (/Windows NT/i.test(ua)) os = "Windows";
  else if (/Mac OS X/i.test(ua) && !/iPhone|iPad/i.test(ua)) os = "macOS";
  else if (/iPhone/i.test(ua)) os = "iOS";
  else if (/iPad/i.test(ua)) os = "iPadOS";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/Linux/i.test(ua)) os = "Linux";

  return { device, browser, os };
}

export async function recordDeviceSession(uid: string, email: string) {
  const sessionId = getSessionId();
  if (!sessionId) return;
  const { device, browser, os } = parseUserAgent();
  const sessionRef = doc(db, "admin_sessions", `${uid}_${sessionId}`);
  await setDoc(sessionRef, {
    uid,
    email,
    sessionId,
    device,
    browser,
    os,
    loginAt: new Date().toISOString(),
    lastActiveAt: serverTimestamp(),
  });
}

export async function pingDeviceSession(uid: string) {
  const sessionId = typeof sessionStorage !== "undefined" ? sessionStorage.getItem(SESSION_KEY) : null;
  if (!sessionId) return;
  const sessionRef = doc(db, "admin_sessions", `${uid}_${sessionId}`);
  try {
    await setDoc(sessionRef, { lastActiveAt: serverTimestamp() }, { merge: true });
  } catch {
    // Silently fail if session was removed
  }
}

export async function removeDeviceSession(uid: string) {
  const sessionId = typeof sessionStorage !== "undefined" ? sessionStorage.getItem(SESSION_KEY) : null;
  if (!sessionId) return;
  const sessionRef = doc(db, "admin_sessions", `${uid}_${sessionId}`);
  try {
    await deleteDoc(sessionRef);
  } catch {
    // Silently fail
  }
  if (typeof sessionStorage !== "undefined") {
    sessionStorage.removeItem(SESSION_KEY);
  }
}

export function subscribeToAdminSessions(callback: (sessions: AdminSession[]) => void) {
  const sessionsRef = collection(db, "admin_sessions");
  return onSnapshot(sessionsRef, (snapshot) => {
    const sessions = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as AdminSession[];
    callback(sessions);
  });
}

export interface AdminSession {
  id: string;
  uid: string;
  email: string;
  sessionId: string;
  device: string;
  browser: string;
  os: string;
  loginAt: string;
  lastActiveAt: any;
}
