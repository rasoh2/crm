import { Badge } from 'react-bootstrap';
import {
  BsPersonPlus,
  BsTelephoneInbound,
  BsClipboardData,
  BsFileEarmarkText,
  BsBriefcase,
  BsCheckCircleFill,
  BsXCircleFill,
  BsShieldExclamation,
  BsExclamationCircle,
  BsDashCircle,
  BsArrowDownShort,
} from 'react-icons/bs';

const STAGE_CONFIG = {
  'Lead nuevo': {
    icon: BsPersonPlus,
    className: 'badge-stage-lead',
    label: 'Lead nuevo',
  },
  Contactado: {
    icon: BsTelephoneInbound,
    className: 'badge-stage-contactado',
    label: 'Contactado',
  },
  Diagnóstico: {
    icon: BsClipboardData,
    className: 'badge-stage-diagnostico',
    label: 'Diagnóstico',
  },
  'Propuesta enviada': {
    icon: BsFileEarmarkText,
    className: 'badge-stage-propuesta',
    label: 'Propuesta enviada',
  },
  Negociación: {
    icon: BsBriefcase,
    className: 'badge-stage-negociacion',
    label: 'Negociación',
  },
  Ganado: {
    icon: BsCheckCircleFill,
    className: 'badge-stage-ganado',
    label: 'Ganado',
  },
  Perdido: {
    icon: BsXCircleFill,
    className: 'badge-stage-perdido',
    label: 'Perdido',
  },
};

const PRIORITY_CONFIG = {
  Crítica: {
    icon: BsShieldExclamation,
    className: 'badge-priority-critica',
    label: 'Crítica',
  },
  Alta: {
    icon: BsExclamationCircle,
    className: 'badge-priority-alta',
    label: 'Alta',
  },
  Media: {
    icon: BsDashCircle,
    className: 'badge-priority-media',
    label: 'Media',
  },
  Baja: {
    icon: BsArrowDownShort,
    className: 'badge-priority-baja',
    label: 'Baja',
  },
};

export function StageBadge({ stage }) {
  const config = STAGE_CONFIG[stage] || {
    icon: BsClipboardData,
    className: 'badge-stage-lead',
    label: stage || '—',
  };
  const Icon = config.icon;

  return (
    <span className={`crm-badge ${config.className}`}>
      <Icon className="crm-badge-icon" />
      <span>{config.label}</span>
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const config = PRIORITY_CONFIG[priority] || {
    icon: BsDashCircle,
    className: 'badge-priority-media',
    label: priority || '—',
  };
  const Icon = config.icon;

  return (
    <span className={`crm-badge ${config.className}`}>
      <Icon className="crm-badge-icon" />
      <span>{config.label}</span>
    </span>
  );
}
