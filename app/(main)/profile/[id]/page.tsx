export default function ProfilePage({ params }: { params: { id: string } }) {
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-stone-900">
        Profile — {params.id}
      </h1>
      {/* Profile page — built in Step 6 */}
    </div>
  );
}
