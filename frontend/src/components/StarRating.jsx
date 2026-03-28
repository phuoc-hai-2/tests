export default function StarRating({ rating, onRate, size = '1rem' }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <span>
      {stars.map(s => (
        <span
          key={s}
          style={{
            fontSize: size,
            cursor: onRate ? 'pointer' : 'default',
            color: s <= rating ? '#ffc107' : '#e4e5e9'
          }}
          onClick={() => onRate && onRate(s)}
        >
          ★
        </span>
      ))}
    </span>
  );
}
