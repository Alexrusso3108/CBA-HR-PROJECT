const AVATAR_COLORS = ['avatar-purple', 'avatar-teal', 'avatar-orange', 'avatar-green', 'avatar-pink', 'avatar-blue'];

function getColor(str = '') {
  let hash = 0;
  for (let c of str) hash = c.charCodeAt(0) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function Avatar({ name = '', size = 'md', className = '' }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const color = getColor(name);
  return (
    <div className={`avatar avatar-${size} ${color} ${className}`}>{initials}</div>
  );
}
