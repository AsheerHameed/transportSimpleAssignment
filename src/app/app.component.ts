// import { Component, Input } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// export interface Trip {
//   from: string;
//   to: string;
//   type: 'normal' | 'arrow' | 'curve';
//   level: number;
// }
// @Component({
//   selector: 'app-root',
//   templateUrl: './app.component.html',
//   standalone: false,
//   styleUrl: './app.component.scss'
// })
// export class AppComponent {
//   title = 'Trip Connector App';
//   tripForm: FormGroup;
//   trips: Trip[] = [
//     { from: 'BLR', to: 'MAA', type: 'normal', level: 1 },
//     { from: 'MAA', to: 'HYD', type: 'arrow', level: 1 },
//     { from: 'BLR', to: 'HYD', type: 'curve', level: 2 },
//     { from: 'HYB', to: 'DEL', type: 'normal', level: 2 },
//     { from: 'DEL', to: 'BLR', type: 'curve', level: 2 }
//   ];

//   constructor(private fb: FormBuilder) {
//     this.tripForm = this.fb.group({
//       startPoint: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(3)]],
//       endPoint: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(3)]]
//     });
//   }

//   addTrip() {
//     if (this.tripForm.valid) {
//       const startPoint = this.tripForm.get('startPoint')?.value.toUpperCase();
//       const endPoint = this.tripForm.get('endPoint')?.value.toUpperCase();
      
//       // Apply the rules for trip connection types
//       const newTrip = this.createTripWithRules(startPoint, endPoint);
      
//       this.trips.push(newTrip);
//       this.tripForm.reset();
//     }
//   }

//   private createTripWithRules(from: string, to: string): Trip {
//     // Check if there are existing trips
//     if (this.trips.length === 0) {
//       return { from, to, type: 'normal', level: 1 };
//     }

//     const lastTrip = this.trips[this.trips.length - 1];
    
//     // Rule 1: If it's a continued trip (end of last trip = start of new trip)
//     if (lastTrip.to === from) {
//       return { from, to, type: 'normal', level: 1 };
//     }
    
//     // Rule 2: If it's not a continued trip, use arrow
//     if (lastTrip.to !== from) {
//       return { from, to, type: 'arrow', level: 1 };
//     }
    
//     // Rule 3: If consecutive trips have the same pickup and drop location
//     const hasSameRoute = this.trips.some(trip => trip.from === from && trip.to === to);
//     if (hasSameRoute) {
//       return { from, to, type: 'normal', level: 2 };
//     }
    
//     // Default case
//     return { from, to, type: 'normal', level: 1 };
//   }

//   clearTrips() {
//     this.trips = [];
//   }

//   // Helper to check if trip is at level 1
//   isLevelOne(trip: Trip): boolean {
//     return trip.level === 1;
//   }

//   // Helper to check if trip is at level 2
//   isLevelTwo(trip: Trip): boolean {
//     return trip.level === 2;
//   }

//   // Helper to determine CSS class based on trip type
//   getTripClass(trip: Trip): string {
//     let classes = ['trip-connector'];
    
//     if (trip.type === 'normal') {
//       classes.push('normal-line');
//     } else if (trip.type === 'arrow') {
//       classes.push('arrow-line');
//     } else if (trip.type === 'curve') {
//       classes.push('curve-line');
//     }
    
//     if (trip.level === 1) {
//       classes.push('level-one');
//     } else {
//       classes.push('level-two');
//     }
    
//     return classes.join(' ');
//   }

//   // Get label for the trip
//   getTripLabel(trip: Trip): string {
//     return `${trip.from} - ${trip.to}`;
//   }

  
  
// }

import { Component, Input } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
interface Trip {
  from: string;
  to: string;
  type: 'normal' | 'arrow' | 'curve';
  level: number; // Using number instead of just 1 or 2 to allow multiple levels
  connected?: boolean;
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Trip Connector';
  
  tripForm!: FormGroup;
  processedTrips: Trip[] = [];
  
  constructor(private fb: FormBuilder) {
    this.initForm();
  }
  
  initForm() {
    this.tripForm = this.fb.group({
      trips: this.fb.array([this.createTripFormGroup()])
    });
  }
  
  get tripFormArray() {
    return this.tripForm.get('trips') as FormArray;
  }
  
  createTripFormGroup(): FormGroup {
    return this.fb.group({
      from: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(3)]],
      to: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(3)]]
    });
  }
  
  addTripForm() {
    this.tripFormArray.push(this.createTripFormGroup());
  }
  
  removeTripForm(index: number) {
    if (this.tripFormArray.length > 1) {
      this.tripFormArray.removeAt(index);
    }
  }
  
  submitTrips() {
    if (this.tripForm.valid) {
      const rawTrips = this.tripFormArray.value;
      this.processTrips(rawTrips);
    }
  }
  
  processTrips(rawTrips: any[]) {

    this.processedTrips = [];
    
    // Process all trips
    for (let i = 0; i < rawTrips.length; i++) {
      const current = rawTrips[i];
      
      current.from = current.from.toUpperCase();
      current.to = current.to.toUpperCase();
      
      // First trip always goes on level 1 with normal tpye
      if (i === 0) {
        this.processedTrips.push({
          from: current.from,
          to: current.to,
          type: 'normal',
          level: 1,
          connected: false
        });
        continue;
      }
      
      const previous = rawTrips[i - 1];
      const previousProcessed = this.processedTrips[i - 1];
      
      // Check if this is a contniued trip (previous.to === current.from)
      if (previous.to === current.from) {
        // it's a continued trip - straight line on the same level as previous
        this.processedTrips.push({
          from: current.from,
          to: current.to,
          type: 'normal',
          level: previousProcessed.level,
          connected: true
        });
      } 
      // Check if this is a duplicate route (same from-to as any previous trip)
      else {
        // Find any trip with the same route
        let existingRouteLevel = 0;
        
        for (const trip of this.processedTrips) {
          if (trip.from === current.from && trip.to === current.to) {
            // Found a trip with the same route, use a level higher than that
            existingRouteLevel = Math.max(existingRouteLevel, trip.level);
          }
        }
        
        if (existingRouteLevel > 0) {
          // It's a duplicate - place one level higher than existing
          this.processedTrips.push({
            from: current.from,
            to: current.to,
            type: 'normal',
            level: existingRouteLevel + 1,
            connected: false
          });
        } else {
          // Not continued and not duplicate - use curve on level 2
          this.processedTrips.push({
            from: current.from,
            to: current.to,
            type: 'curve',
            level: 2,
            connected: false
          });
        }
      }
    }
  }

  getTripsForLevel(level: number): Trip[] {
    return this.processedTrips.filter(trip => trip.level === level);
  }
  
  // Get all levels in the current trip set
  getLevels(): number[] {
    const levels = new Set<number>();
    this.processedTrips.forEach(trip => levels.add(trip.level));
    return Array.from(levels).sort();
  }
  
  getTripLabel(trip: Trip): string {
    return `${trip.from} - ${trip.to}`;
  }
  
  resetForm() {
    this.initForm();
    this.processedTrips = [];
  }
}