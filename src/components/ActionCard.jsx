import React from "react";
import { styles } from "../styles/AppStyles";

const ActionCard = ({ title, icon: Icon, color, onClick, description }) => (
  <div 
    style={{
      ...styles.actionCard,
      borderLeft: `4px solid ${color}`
    }}
    onClick={onClick}
  >
    <div style={{ ...styles.iconContainer, background: `${color}15` }}>
      <Icon size={20} color={color} />
    </div>
    <div style={styles.cardContent}>
      <h4 style={styles.cardTitle}>{title}</h4>
      <p style={styles.cardDescription}>{description}</p>
    </div>
  </div>
);

export default ActionCard;
