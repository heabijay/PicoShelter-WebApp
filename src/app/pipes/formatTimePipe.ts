import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: "formatTime"
})
export class FormatTimePipe implements PipeTransform {
    transform(value: number): string {
        let v = value;
        const ms = v % 1000;
        v = Math.floor(v / 1000);
        const ss = v % 60;
        v = Math.floor(v / 60);
        const mm = v % 60;
        v = Math.floor(v / 60);
        const hh = v % 24;
        v = Math.floor(v / 24);
        const dd = v;

        return (
            (dd > 0 ? dd + " days " : "") +
            ("00" + hh).slice(-2) +
            ":" +
            ("00" + mm).slice(-2) +
            ":" +
            ("00" + ss).slice(-2)
        );
    }
}
