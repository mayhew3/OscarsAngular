
export class OddsInterface {

  constructor(private percentage: number) {
  }

  static fromPercentage(percentage: number): OddsInterface {
    return new OddsInterface(percentage);
  }

  static fromRatio(numerator: number, denominator: number): OddsInterface {
    const percentage = denominator / (numerator + denominator);
    return new OddsInterface(percentage);
  }

  static fromMoneyline(moneyline: number): OddsInterface {
    return new OddsInterface(this.getPercentage(moneyline));
  }

  static fromMoneylineFormatted(moneylineFormatted: string): OddsInterface {
    const withoutPlus = moneylineFormatted.replace('+', '');
    const moneyline = +withoutPlus;
    return new OddsInterface(this.getPercentage(moneyline));
  }

  static getPercentage(moneyline: number): number {
    if (moneyline < 0) {
      return (-moneyline / (-moneyline + 100));
    } else {
      return (100 / (moneyline + 100));
    }
  }

  asPercentage(): number {
    return this.percentage;
  }

  asRatio(): {numerator: number; denominator: number} {
    if (this.percentage > 0.5) {
      const denominator = (1 / (1 - this.percentage)) - 1;
      return {
        numerator: 1,
        denominator
      };
    } else {
      const numerator = (1 / this.percentage) - 1;
      return {
        numerator,
        denominator: 1
      };
    }
  }

  asMoneyline(): number {
    const negative = 0 - (this.percentage / (1 - this.percentage)) * 100;
    const positive = ((1 - this.percentage) / this.percentage) * 100;
    return this.percentage >= 0.5 ? negative : positive;
  }

  asMoneylineFormatted(): string {
    const moneyline = Math.round(this.asMoneyline());
    return moneyline > 0 ? '+' + moneyline : moneyline.toString();
  }
}
