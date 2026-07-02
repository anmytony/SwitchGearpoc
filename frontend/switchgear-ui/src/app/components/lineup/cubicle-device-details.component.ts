import {
  Component,
  Input,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Device } from '../../models/models';

interface DeviceParameter {
  value: string;
  confidence: number;
  source: string;
  sourcePage: number;
}

interface CircuitBreakerDetails {
  model: DeviceParameter;
  rating: DeviceParameter;
  breakingCapacity?: DeviceParameter;
  makingCapacity?: DeviceParameter;
  mechanismType?: DeviceParameter;
  numberOfPoles?: DeviceParameter;
}

interface TransformerDetails {
  ratio: DeviceParameter;
  accuracyClass?: DeviceParameter;
  burden?: DeviceParameter;
  coreType?: DeviceParameter;
  insulationLevel?: DeviceParameter;
}

interface RelayDetails {
  model: DeviceParameter;
  protectionFunctions: string[];
  protectionFunctionsConfidence: number;
  protectionFunctionsSource: string;
  auxVoltage?: DeviceParameter;
  communicationProtocol: string[];
}

interface DisconnectorDetails {
  count?: DeviceParameter;
  operatingMode?: DeviceParameter;
}

interface EarthingSwitchDetails {
  present: boolean;
  id?: DeviceParameter;
}

interface SurgeArresterDetails {
  present: boolean;
}

interface AuxiliaryDetails {
  controlVoltage?: DeviceParameter;
}

interface CubicleDeviceDetails {
  position: number;
  functionalPosition: string;
  panelType: string;
  circuitBreaker: CircuitBreakerDetails;
  currentTransformer: TransformerDetails;
  voltageTransformer: TransformerDetails;
  protectionRelay: RelayDetails;
  disconnector: DisconnectorDetails;
  earthingSwitch: EarthingSwitchDetails;
  surgeArrester: SurgeArresterDetails;
  auxiliary: AuxiliaryDetails;
}

@Component({
  selector: 'app-cubicle-device-details',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './cubicle-device-details.component.html',
  styleUrls: ['./cubicle-device-details.component.scss']
})
export class CubicleDeviceDetailsComponent {
  @Input() cubicle: CubicleDeviceDetails | null = null;
  @Input() recommendedDevices: Device[] = [];
  @Input() panelLabel: string | null = null;

  confidenceClass(confidence: number): string {
    if (confidence >= 0.95) return 'confidence-high';
    if (confidence >= 0.80) return 'confidence-medium';
    return 'confidence-low';
  }

  confidenceLabel(confidence: number): string {
    if (confidence >= 0.95) return 'High';
    if (confidence >= 0.80) return 'Medium';
    return 'Low';
  }

  hasData(): boolean {
    return this.cubicle !== null && (
      !!this.cubicle.circuitBreaker?.model?.value ||
      !!this.cubicle.circuitBreaker?.rating?.value ||
      !!this.cubicle.circuitBreaker?.breakingCapacity?.value ||
      !!this.cubicle.currentTransformer?.ratio?.value ||
      !!this.cubicle.voltageTransformer?.ratio?.value ||
      !!this.cubicle.protectionRelay?.model?.value ||
      !!this.cubicle.disconnector?.count?.value ||
      !!this.cubicle.earthingSwitch?.present ||
      !!this.cubicle.surgeArrester?.present ||
      !!this.cubicle.auxiliary?.controlVoltage?.value
    );
  }
}
