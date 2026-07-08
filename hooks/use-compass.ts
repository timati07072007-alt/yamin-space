"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type CompassPermission =
  | "idle"
  | "requesting"
  | "granted"
  | "denied"
  | "unsupported";

interface CompassState {
  /** Азимут устройства относительно севера, 0..360°. null — данных ещё нет. */
  heading: number | null;
  permission: CompassPermission;
  /** true, если события приходят (сенсор реально работает). */
  isActive: boolean;
  requestAccess: () => Promise<void>;
}

/** iOS Safari отдаёт компасный курс в нестандартном поле webkitCompassHeading. */
interface WebkitOrientationEvent extends DeviceOrientationEvent {
  webkitCompassHeading?: number;
}

interface PermissionCapableEvent {
  requestPermission?: () => Promise<"granted" | "denied">;
}

function readHeading(event: DeviceOrientationEvent): number | null {
  const webkitHeading = (event as WebkitOrientationEvent).webkitCompassHeading;

  if (typeof webkitHeading === "number" && !Number.isNaN(webkitHeading)) {
    return webkitHeading;
  }

  if (event.absolute && event.alpha !== null) {
    return (360 - event.alpha) % 360;
  }

  if (event.alpha !== null) {
    return (360 - event.alpha) % 360;
  }

  return null;
}

export function useCompass(): CompassState {
  const [heading, setHeading] = useState<number | null>(null);
  const [permission, setPermission] = useState<CompassPermission>("idle");
  const [isActive, setIsActive] = useState(false);
  const listeningRef = useRef(false);

  const attachListener = useCallback(() => {
    if (listeningRef.current || typeof window === "undefined") {
      return;
    }

    listeningRef.current = true;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const nextHeading = readHeading(event);

      if (nextHeading !== null) {
        setHeading(nextHeading);
        setIsActive(true);
      }
    };

    window.addEventListener("deviceorientationabsolute", handleOrientation);
    window.addEventListener("deviceorientation", handleOrientation);
  }, []);

  const requestAccess = useCallback(async () => {
    if (typeof window === "undefined" || !("DeviceOrientationEvent" in window)) {
      setPermission("unsupported");
      return;
    }

    setPermission("requesting");

    const eventClass = DeviceOrientationEvent as unknown as PermissionCapableEvent;

    try {
      if (typeof eventClass.requestPermission === "function") {
        const result = await eventClass.requestPermission();

        if (result !== "granted") {
          setPermission("denied");
          return;
        }
      }

      setPermission("granted");
      attachListener();
    } catch (error) {
      console.warn("[Compass] Permission request failed:", error);
      setPermission("denied");
    }
  }, [attachListener]);

  useEffect(() => {
    return () => {
      listeningRef.current = false;
    };
  }, []);

  return { heading, permission, isActive, requestAccess };
}
