export default function SubmitButton({ isSubmitting = false }) {
  return (
    <button className="button button-primary button-large submit-button" disabled={isSubmitting} type="submit">
      {isSubmitting ? '등록 중' : '공고 등록하기'}
    </button>
  );
}
