import React, { useState, useEffect } from 'react';
    import { User, Mail, Calendar } from 'lucide-react';
    import type { Profile } from '../../types/profile';
    import { supabase } from '../../lib/supabase';
    
    interface ProfileHeaderProps {
      profile: Profile;
    }
    
    export function ProfileHeader({ profile }: ProfileHeaderProps) {
      const fullName = [profile.first_name, profile.last_name]
        .filter(Boolean)
        .join(' ');
    
      const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '');
    
      useEffect(() => {
        setAvatarUrl(profile.avatar_url || '');
      }, [profile.avatar_url]);
    
      return (
        <div className="bg-white dark:bg-darkBackground dark:text-gray-100 dark:text-gray-200 rounded-lg shadow-md p-6 transition-all duration-300">
          <div className="flex items-start space-x-6">
            <div className="flex-shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={fullName}
                  className="h-24 w-24 rounded-full object-cover"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>
    
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold dark:text-gray-100">{fullName}</h1>
                  {profile.profile_name && (
                    <p className="text-gray-500">@{profile.profile_name}</p>
                  )}
                </div>
              </div>
    
              <div className="mt-4 flex items-center space-x-4 text-gray-500">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-1" />
                  <span>{profile.email}</span>
                </div>
                {profile.age && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{profile.age} years old</span>
                  </div>
                )}
                {profile.gender && (
                  <div className="px-2 py-1 rounded-full dark:bg-gray-700 text-sm">
                    {profile.gender}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }
