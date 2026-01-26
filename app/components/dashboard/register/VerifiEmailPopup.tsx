interface VerifyEmailModalProps {
    open: boolean
    onConfirm: () => void
    onCancel: () => void
  }
  
  export const VerifyEmailModal = ({ open, onConfirm, onCancel }: VerifyEmailModalProps) => {
    if (!open) return null
  
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-background rounded-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-semibold">Zweryfikuj email</h2>
  
          <p className="text-muted-foreground mt-3">
            Wysłaliśmy link weryfikacyjny na Twój adres email.
            Kliknij w link, a następnie naciśnij przycisk poniżej.
          </p>
  
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-md border"
            >
              Anuluj
            </button>
  
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground"
            >
              Zweryfikowałem
            </button>
          </div>
        </div>
      </div>
    )
  }
  