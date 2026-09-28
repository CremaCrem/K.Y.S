import React, { useState } from 'react';
import { Alert, Button, Card, TextField } from './ui';
import { useLanguage } from '../context/LanguageContext';

// Same forgiving rules as vault.js: case-insensitive, O reads as 0, I/L as 1.
const normalize = (text) => text.trim().toUpperCase().replace(/O/g, '0').replace(/[IL]/g, '1');

// Shown after setup and after "Create new recovery kit". The user can't
// continue until they type back the last 4 characters.
const RecoveryKit = ({ code, onDone }) => {
  const { t } = useLanguage();
  const [typed, setTyped] = useState('');
  const confirmed = normalize(typed) === code.slice(-4);

  return (
    <div className="h-full overflow-auto flex items-center justify-center p-6">
      <Card className="w-full max-w-lg flex flex-col gap-4">
        {/* Everything in .print-area is what gets printed (see index.css). */}
        <div className="print-area flex flex-col gap-3">
          <h1 className="text-2xl font-extrabold font-wordmark">K.Y.S · {t('kitTitle')}</h1>
          <p className="text-sm">{t('kitIntro')}</p>
          <div className="font-mono text-2xl font-medium tracking-wider text-center p-4 border-2 border-dashed border-border-strong rounded-kys-md bg-surface-sunken select-all">
            {code}
          </div>
          <p className="text-xs text-muted">{t('kitCreated')}: {new Date().toLocaleDateString()}</p>
          <p className="text-sm">{t('kitHowTo')}</p>
          <Alert tone="warning">{t('kitWarning')}</Alert>
        </div>

        <p className="text-sm text-muted">{t('kitStore')}</p>

        <Button variant="outline" size="lg" icon="print" fullWidth onClick={() => window.print()}>{t('kitPrint')}</Button>

        <TextField label={t('kitConfirm')} value={typed} onChange={(e) => setTyped(e.target.value)} maxLength={4} spellCheck={false} mono
          inputStyle={{ textTransform: 'uppercase', letterSpacing: '0.3em', textAlign: 'center' }} />

        <Button size="xl" fullWidth disabled={!confirmed} onClick={onDone}>{t('kitDone')}</Button>
      </Card>
    </div>
  );
};

export default RecoveryKit;
