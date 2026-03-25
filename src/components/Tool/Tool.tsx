import './Tool.module.css';

interface ToolProps {
  title: string;
  description: string;
  features: string[];
  icon?: string;
}

export function Tool({ title, description, features, icon }: ToolProps) {
  return (
    <div className="tool-card">
      {icon && <div className="tool-icon">{icon}</div>}
      <h3 className="tool-title">{title}</h3>
      <p className="tool-description">{description}</p>
      <ul className="tool-features">
        {features.map((feature, idx) => (
          <li key={idx}>{feature}</li>
        ))}
      </ul>
    </div>
  );
}
