import React from 'react';
import './Skeleton.css';

export function SkeletonText({ width = '100%', height = '1em', className = '' }) {
    return <div className={`pm-skeleton pm-skeleton-text ${className}`} style={{ width, height }} />;
}

export function SkeletonBlock({ width = '100%', height = '100%', className = '' }) {
    return <div className={`pm-skeleton ${className}`} style={{ width, height, borderRadius: '8px' }} />;
}

export function AppSkeleton() {
    return (
        <div className="app">
            <header className="app-header">
                <SkeletonText width="150px" height="24px" />
                <div style={{ display: 'flex', gap: '10px' }}>
                    <SkeletonText width="100px" height="20px" />
                    <SkeletonText width="80px" height="30px" />
                </div>
            </header>
            <div className="respondent-layout" style={{ gridTemplateColumns: '25% 4px 1fr' }}>
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <SkeletonText width="80%" height="20px" />
                    <SkeletonText width="90%" height="20px" />
                    <SkeletonText width="60%" height="20px" />
                    <SkeletonText width="70%" height="20px" />
                    <SkeletonText width="85%" height="20px" />
                </div>
                <div className="resizer" />
                <div style={{ padding: '20px' }}>
                    <SkeletonBlock width="100%" height="100%" />
                </div>
            </div>
        </div>
    );
}
