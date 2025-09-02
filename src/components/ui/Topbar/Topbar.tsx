"use client";
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { supabase } from "@/lib/supabase";
import styles from "./Topbar.module.css";
import Image from "next/image";
import { faUserCircle } from "@fortawesome/free-solid-svg-icons/faUserCircle";

export const Topbar: React.FC = () => {
  const [isAuthed, setIsAuthed] = useState<boolean>(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

// checks does the user is authentiacted or not and can be replaced in future as the user increases we may use Cache

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      setIsAuthed(!!session);

      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("avatar_url")
          .eq("id", session.user.id)
          .single();

        if (profile?.avatar_url) {
          setAvatarUrl(profile.avatar_url);
        }
      }
    });
// getting the user avatar_url and checking for the id 
    const { data: sub } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setIsAuthed(!!session);
        if (session?.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("avatar_url")
            .eq("id", session.user.id)
            .single();
          if (profile?.avatar_url) {
            setAvatarUrl(profile.avatar_url);
          }
        } else {
          setAvatarUrl(null);
        }
      }
    );
// from the previous code 
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return (
    <header className={styles.mainHeader}>
      <div className={styles.container}>
        <h1 className={styles.logo}>
          <a href="/">FairPlay</a>
        </h1>

        <div className={styles.searchBar}>
          <input type="text" placeholder="Search videos..." />
          <button type="submit" aria-label="Search">
            <FontAwesomeIcon icon={faSearch} />
          </button>
        </div>

        <div className={styles.headerActions}>
          {!isAuthed && (
            <>
              <a href="/login" className={styles.loginButton}>
                Login
              </a>
              <a href="/login?register=true" className={styles.loginButton}>
                SignUp
              </a>
            </>
          )}
          // if avatar does not load up because of some bad request then replace it with user profile icon 
          {isAuthed && (
            <a href="/mychannel" className={styles.avatarWrapper}>
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt="User avatar"
                  width={36}
                  height={36}
                  className={styles.avatar}
                  onError={() => setAvatarUrl(null)}
                />
              ) : (
                <FontAwesomeIcon
                  icon={faUserCircle}
                  size="2x"
                  className={styles.userIcon}
                />
              )}
            </a>
          )}
          <button
            className={styles.donateButton}
            onClick={() => window.open("https://ko-fi.com/fairplay_", "_blank")}
          >
            Donate
          </button>
        </div>
      </div>
    </header>
  );
};
