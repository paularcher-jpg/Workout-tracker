// Programs for endurance athletes — runners, cyclists, triathletes and
// mountain athletes. The job of the gym here is to make you durable and
// economical, not big, so volume is deliberately low and the heavy work is
// genuinely heavy.
//
// The muscular endurance block follows the method published by Steve House
// and Scott Johnston for mountain athletes: high-rep loaded step-ups and
// lunges, bodyweight first, rest shrinking before load rises.

export const ENDURANCE = [
  {
    id: 'weighted-carry-endurance',
    name: 'Weighted Carry Endurance',
    goal: 'endurance',
    level: 'intermediate',
    days: 1,
    weeks: 8,
    repeat: false,
    equipment: 'Steep hill or stairs and a loaded pack',
    source: 'The weighted carry method for muscular endurance as described by Scott Johnston at Evoke Endurance.',
    summary: 'Load a pack and go uphill. The simplest way to build fatigue resistance.',
    detail: 'The simplest muscular endurance session there is: put weight on your back and climb. '
      + 'Five-minute laps building from thirty minutes of climbing to an hour over eight weeks, once '
      + 'a week, on top of your normal easy aerobic volume.\n\n'
      + 'You need real steepness — thirty per cent grade or more, which rules out most graded trails. '
      + 'Fire stairs in a tall building work well, and a stair machine will do the job if that is what '
      + 'you have. Water jugs in a pack are the classic load because you can tip them out at the top; '
      + 'a vest works too.\n\n'
      + 'The load has to be heavy enough that your legs are the limit and not your breathing. You want '
      + 'a low-grade burn in the quads and glutes for the whole climb. Ignore your heart rate entirely '
      + 'on these — it will read lower than you expect, and that is the session working as intended. '
      + 'Finding the right weight takes a bit of experimenting.\n\n'
      + 'Start at thirty minutes of climbing even if that feels easy. An hour is plenty for anyone, '
      + 'including athletes at the sharp end.',
    csv: `Phase,Weeks,Weekday,Workout,Order,Exercise,Sets,Reps,Rest (s),RPE,Notes
Week 1,1,Wed,Weighted Carry,1,Weighted Uphill Carry,6,300s,120,8,Steep hill, fire stairs or a stair machine. Heavy enough that your legs are the limit, not your breathing. Ignore your heart rate.
Week 1,1,Wed,Weighted Carry,2,Easy Aerobic,1,600s,60,4,Cool down.
Week 2,2,Wed,Weighted Carry,1,Weighted Uphill Carry,7,300s,120,8,Same load. One more lap than last week.
Week 2,2,Wed,Weighted Carry,2,Easy Aerobic,1,600s,60,4,Cool down.
Week 3,3,Wed,Weighted Carry,1,Weighted Uphill Carry,8,300s,120,8,Same load. One more lap than last week.
Week 3,3,Wed,Weighted Carry,2,Easy Aerobic,1,600s,60,4,Cool down.
Week 4,4,Wed,Weighted Carry,1,Weighted Uphill Carry,9,300s,120,8,Same load. One more lap than last week.
Week 4,4,Wed,Weighted Carry,2,Easy Aerobic,1,600s,60,4,Cool down.
Week 5,5,Wed,Weighted Carry,1,Weighted Uphill Carry,10,300s,120,8,Same load. One more lap than last week.
Week 5,5,Wed,Weighted Carry,2,Easy Aerobic,1,600s,60,4,Cool down.
Week 6,6,Wed,Weighted Carry,1,Weighted Uphill Carry,11,300s,120,8,Same load. One more lap than last week.
Week 6,6,Wed,Weighted Carry,2,Easy Aerobic,1,600s,60,4,Cool down.
Week 7,7,Wed,Weighted Carry,1,Weighted Uphill Carry,12,300s,120,8,Same load. One more lap than last week.
Week 7,7,Wed,Weighted Carry,2,Easy Aerobic,1,600s,60,4,Cool down.
Week 8,8,Wed,Weighted Carry,1,Weighted Uphill Carry,12,300s,120,8,Same as last week. Hold the quality.
Week 8,8,Wed,Weighted Carry,2,Easy Aerobic,1,600s,60,4,Cool down.`,
  },
  {
    id: 'gym-muscular-endurance',
    name: 'Gym Muscular Endurance',
    goal: 'endurance',
    level: 'advanced',
    days: 1,
    weeks: 14,
    repeat: false,
    equipment: 'Box, weight vest and kettlebell',
    source: 'The gym muscular endurance progression as published by Scott Johnston at Evoke Endurance, '
      + 'built on Yuri Verkhoshansky\u2019s muscular endurance work.',
    summary: 'Fourteen workouts, once a week. Jumps, step-ups and lunges against a shrinking clock.',
    detail: 'One session a week for fourteen weeks, done on top of your own easy aerobic volume. '
      + 'Split jump squats, squat jumps, box step-ups and front lunges, all for sets of ten, until the '
      + 'working muscle burns. It builds legs that hold their pace late in a long day, and it builds '
      + 'them fast.\n\n'
      + 'Work station by station, not as a circuit: every set of an exercise before you move to the '
      + 'next. Step-ups and front lunges are done all one leg then all the other. Keep to the tempos '
      + 'and do not rush.\n\n'
      + 'The progression is mostly about rest, not load. The first three workouts are bodyweight only. '
      + 'A vest comes on at workout four at ten per cent of bodyweight, rising to fifteen per cent by '
      + 'workout nine, and two more exercises join from workout four. From there the rest between sets '
      + 'falls from sixty seconds to ten, which is what makes the last few genuinely hard.\n\n'
      + 'Three things to take seriously. This goes on top of your Zone 1 and 2 volume, not instead of '
      + 'it — trading easy aerobic hours for these will give you a quick gain, then a plateau, then a '
      + 'decline. If you are not improving week to week you are recovering too little, not doing too '
      + 'little. And if you are new to this, use bodyweight for the first two or three workouts and cut '
      + 'to four sets; these feel easy while you do them and find you two days later.\n\n'
      + 'You need at least eight sessions for the benefit. Miss one and drop back two workouts.',
    csv: `Phase,Weeks,Weekday,Workout,Order,Exercise,Sets,Reps,Rest (s),RPE,Notes
Workout 1,1,Wed,Workout 1,1,Easy Aerobic,1,780s,60,5,Warm up. Build to a hard effort for the last two minutes. Rest 60s between exercises.
Workout 1,1,Wed,Workout 1,2,Floor Get-Up,1,10,30,5,Up off the floor from lying down. Any way you like.
Workout 1,1,Wed,Workout 1,3,Burpee,1,10,60,6,Finishes the warm up.
Workout 1,1,Wed,Workout 1,4,Split Jump Squat,6,10 each,60,8.5,About one jump a second.
Workout 1,1,Wed,Workout 1,5,Squat Jump,6,10,60,8.5,About one jump every half to one second.
Workout 1,1,Wed,Workout 1,6,Box Step-Up,6,10 each,30,8.5,Box about three quarters of the way to your kneecap. All right leg then all left.
Workout 1,1,Wed,Workout 1,7,Front Lunge,6,10 each,30,8.5,All right leg then all left. Start with a gentle 40 to 60cm step. This one hits the glutes hardest.
Workout 1,1,Wed,Workout 1,8,Easy Aerobic,1,600s,60,4,Cool down.
Workout 2,2,Wed,Workout 2,1,Easy Aerobic,1,780s,60,5,Warm up. Build to a hard effort for the last two minutes. Rest 60s between exercises.
Workout 2,2,Wed,Workout 2,2,Floor Get-Up,1,10,30,5,Up off the floor from lying down. Any way you like.
Workout 2,2,Wed,Workout 2,3,Burpee,1,10,60,6,Finishes the warm up.
Workout 2,2,Wed,Workout 2,4,Split Jump Squat,6,10 each,60,8.5,About one jump a second.
Workout 2,2,Wed,Workout 2,5,Squat Jump,6,10,60,8.5,About one jump every half to one second.
Workout 2,2,Wed,Workout 2,6,Box Step-Up,6,10 each,30,8.5,Box about three quarters of the way to your kneecap. All right leg then all left.
Workout 2,2,Wed,Workout 2,7,Front Lunge,6,10 each,30,8.5,All right leg then all left. Start with a gentle 40 to 60cm step. This one hits the glutes hardest.
Workout 2,2,Wed,Workout 2,8,Easy Aerobic,1,600s,60,4,Cool down.
Workout 3,3,Wed,Workout 3,1,Easy Aerobic,1,780s,60,5,Warm up. Build to a hard effort for the last two minutes. Rest 60s between exercises.
Workout 3,3,Wed,Workout 3,2,Floor Get-Up,1,10,30,5,Up off the floor from lying down. Any way you like.
Workout 3,3,Wed,Workout 3,3,Burpee,1,10,60,6,Finishes the warm up.
Workout 3,3,Wed,Workout 3,4,Split Jump Squat,6,10 each,45,8.5,About one jump a second.
Workout 3,3,Wed,Workout 3,5,Squat Jump,6,10,45,8.5,About one jump every half to one second.
Workout 3,3,Wed,Workout 3,6,Box Step-Up,6,10 each,30,8.5,Box about three quarters of the way to your kneecap. All right leg then all left.
Workout 3,3,Wed,Workout 3,7,Front Lunge,6,10 each,30,8.5,All right leg then all left. Start with a gentle 40 to 60cm step. This one hits the glutes hardest.
Workout 3,3,Wed,Workout 3,8,Easy Aerobic,1,600s,60,4,Cool down.
Workout 4,4,Wed,Workout 4,1,Easy Aerobic,1,780s,60,5,Warm up. Build to a hard effort for the last two minutes. Rest 60s between exercises.
Workout 4,4,Wed,Workout 4,2,Floor Get-Up,1,10,30,5,Up off the floor from lying down. Any way you like.
Workout 4,4,Wed,Workout 4,3,Burpee,1,10,60,6,Finishes the warm up.
Workout 4,4,Wed,Workout 4,4,Split Jump Squat,5,10 each,60,8.5,Vest at 10% bodyweight. About one jump a second.
Workout 4,4,Wed,Workout 4,5,Squat Jump,5,10,60,8.5,Vest at 10% bodyweight. About one jump every half to one second.
Workout 4,4,Wed,Workout 4,6,Box Step-Up,5,10 each,60,8.5,Vest at 10% bodyweight. Box about three quarters of the way to your kneecap. All right leg then all left.
Workout 4,4,Wed,Workout 4,7,Front Lunge,5,10 each,60,8.5,Vest at 10% bodyweight. All right leg then all left. Start with a gentle 40 to 60cm step. This one hits the glutes hardest.
Workout 4,4,Wed,Workout 4,8,Goblet Squat to Press,5,10,60,8.5,Vest at 10% bodyweight.
Workout 4,4,Wed,Workout 4,9,Kettlebell Swing,5,10,60,8.5,Two handed.
Workout 4,4,Wed,Workout 4,10,Easy Aerobic,1,600s,60,4,Cool down.
Workout 5,5,Wed,Workout 5,1,Easy Aerobic,1,780s,60,5,Warm up. Build to a hard effort for the last two minutes. Rest 90s between exercises.
Workout 5,5,Wed,Workout 5,2,Floor Get-Up,1,10,30,5,Up off the floor from lying down. Any way you like.
Workout 5,5,Wed,Workout 5,3,Burpee,1,10,60,6,Finishes the warm up.
Workout 5,5,Wed,Workout 5,4,Split Jump Squat,6,10 each,45,8.5,Vest at 10% bodyweight. About one jump a second.
Workout 5,5,Wed,Workout 5,5,Squat Jump,6,10,45,8.5,Vest at 10% bodyweight. About one jump every half to one second.
Workout 5,5,Wed,Workout 5,6,Box Step-Up,6,10 each,30,8.5,Vest at 10% bodyweight. Box about three quarters of the way to your kneecap. All right leg then all left.
Workout 5,5,Wed,Workout 5,7,Front Lunge,6,10 each,30,8.5,Vest at 10% bodyweight. All right leg then all left. Start with a gentle 40 to 60cm step. This one hits the glutes hardest.
Workout 5,5,Wed,Workout 5,8,Goblet Squat to Press,6,10,45,8.5,Vest at 10% bodyweight.
Workout 5,5,Wed,Workout 5,9,Kettlebell Swing,6,10,45,8.5,Two handed.
Workout 5,5,Wed,Workout 5,10,Easy Aerobic,1,600s,60,4,Cool down.
Workout 6,6,Wed,Workout 6,1,Easy Aerobic,1,780s,60,5,Warm up. Build to a hard effort for the last two minutes. Rest 60s between exercises.
Workout 6,6,Wed,Workout 6,2,Floor Get-Up,1,10,30,5,Up off the floor from lying down. Any way you like.
Workout 6,6,Wed,Workout 6,3,Burpee,1,10,60,6,Finishes the warm up.
Workout 6,6,Wed,Workout 6,4,Split Jump Squat,6,10 each,40,8.5,Vest at 10% bodyweight. About one jump a second.
Workout 6,6,Wed,Workout 6,5,Squat Jump,6,10,40,8.5,Vest at 10% bodyweight. About one jump every half to one second.
Workout 6,6,Wed,Workout 6,6,Box Step-Up,6,10 each,30,8.5,Vest at 10% bodyweight. Box about three quarters of the way to your kneecap. All right leg then all left.
Workout 6,6,Wed,Workout 6,7,Front Lunge,6,10 each,30,8.5,Vest at 10% bodyweight. All right leg then all left. Start with a gentle 40 to 60cm step. This one hits the glutes hardest.
Workout 6,6,Wed,Workout 6,8,Goblet Squat to Press,6,10,40,8.5,Vest at 10% bodyweight.
Workout 6,6,Wed,Workout 6,9,Kettlebell Swing,6,10,40,8.5,Two handed.
Workout 6,6,Wed,Workout 6,10,Easy Aerobic,1,600s,60,4,Cool down.
Workout 7,7,Wed,Workout 7,1,Easy Aerobic,1,780s,60,5,Warm up. Build to a hard effort for the last two minutes. Rest 60s between exercises.
Workout 7,7,Wed,Workout 7,2,Floor Get-Up,1,10,30,5,Up off the floor from lying down. Any way you like.
Workout 7,7,Wed,Workout 7,3,Burpee,1,10,60,6,Finishes the warm up.
Workout 7,7,Wed,Workout 7,4,Split Jump Squat,6,10 each,30,8.5,Vest at 10% bodyweight. About one jump a second.
Workout 7,7,Wed,Workout 7,5,Squat Jump,6,10,30,8.5,Vest at 10% bodyweight. About one jump every half to one second.
Workout 7,7,Wed,Workout 7,6,Box Step-Up,6,10 each,30,8.5,Vest at 10% bodyweight. Box about three quarters of the way to your kneecap. All right leg then all left.
Workout 7,7,Wed,Workout 7,7,Front Lunge,6,10 each,30,8.5,Vest at 10% bodyweight. All right leg then all left. Start with a gentle 40 to 60cm step. This one hits the glutes hardest.
Workout 7,7,Wed,Workout 7,8,Goblet Squat to Press,6,10,30,8.5,Vest at 10% bodyweight.
Workout 7,7,Wed,Workout 7,9,Kettlebell Swing,6,10,30,8.5,Two handed.
Workout 7,7,Wed,Workout 7,10,Easy Aerobic,1,600s,60,4,Cool down.
Workout 8,8,Wed,Workout 8,1,Easy Aerobic,1,780s,60,5,Warm up. Build to a hard effort for the last two minutes. Rest 60s between exercises.
Workout 8,8,Wed,Workout 8,2,Floor Get-Up,1,10,30,5,Up off the floor from lying down. Any way you like.
Workout 8,8,Wed,Workout 8,3,Burpee,1,10,60,6,Finishes the warm up.
Workout 8,8,Wed,Workout 8,4,Split Jump Squat,8,10 each,45,8.5,Vest at 10% bodyweight. About one jump a second.
Workout 8,8,Wed,Workout 8,5,Squat Jump,8,10,45,8.5,Vest at 10% bodyweight. About one jump every half to one second.
Workout 8,8,Wed,Workout 8,6,Box Step-Up,8,10 each,30,8.5,Vest at 10% bodyweight. Box about three quarters of the way to your kneecap. All right leg then all left.
Workout 8,8,Wed,Workout 8,7,Front Lunge,8,10 each,30,8.5,Vest at 10% bodyweight. All right leg then all left. Start with a gentle 40 to 60cm step. This one hits the glutes hardest.
Workout 8,8,Wed,Workout 8,8,Goblet Squat to Press,8,10,45,8.5,Vest at 10% bodyweight.
Workout 8,8,Wed,Workout 8,9,Kettlebell Swing,8,10,45,8.5,Two handed.
Workout 8,8,Wed,Workout 8,10,Easy Aerobic,1,600s,60,4,Cool down.
Workout 9,9,Wed,Workout 9,1,Easy Aerobic,1,780s,60,5,Warm up. Build to a hard effort for the last two minutes. Rest 45s between exercises.
Workout 9,9,Wed,Workout 9,2,Floor Get-Up,1,10,30,5,Up off the floor from lying down. Any way you like.
Workout 9,9,Wed,Workout 9,3,Burpee,1,10,60,6,Finishes the warm up.
Workout 9,9,Wed,Workout 9,4,Split Jump Squat,6,10 each,40,8.5,Vest at 15% bodyweight. About one jump a second.
Workout 9,9,Wed,Workout 9,5,Squat Jump,6,10,40,8.5,Vest at 15% bodyweight. About one jump every half to one second.
Workout 9,9,Wed,Workout 9,6,Box Step-Up,6,10 each,30,8.5,Vest at 15% bodyweight. Box about three quarters of the way to your kneecap. All right leg then all left.
Workout 9,9,Wed,Workout 9,7,Front Lunge,6,10 each,30,8.5,Vest at 15% bodyweight. All right leg then all left. Start with a gentle 40 to 60cm step. This one hits the glutes hardest.
Workout 9,9,Wed,Workout 9,8,Goblet Squat to Press,6,10,40,8.5,Vest at 15% bodyweight.
Workout 9,9,Wed,Workout 9,9,Kettlebell Swing,6,10,40,8.5,Two handed.
Workout 9,9,Wed,Workout 9,10,Easy Aerobic,1,600s,60,4,Cool down.
Workout 10,10,Wed,Workout 10,1,Easy Aerobic,1,780s,60,5,Warm up. Build to a hard effort for the last two minutes. Rest 30s between exercises.
Workout 10,10,Wed,Workout 10,2,Floor Get-Up,1,10,30,5,Up off the floor from lying down. Any way you like.
Workout 10,10,Wed,Workout 10,3,Burpee,1,10,60,6,Finishes the warm up.
Workout 10,10,Wed,Workout 10,4,Split Jump Squat,8,10 each,45,8.5,Vest at 15% bodyweight. About one jump a second.
Workout 10,10,Wed,Workout 10,5,Squat Jump,8,10,45,8.5,Vest at 15% bodyweight. About one jump every half to one second.
Workout 10,10,Wed,Workout 10,6,Box Step-Up,8,10 each,30,8.5,Vest at 15% bodyweight. Box about three quarters of the way to your kneecap. All right leg then all left.
Workout 10,10,Wed,Workout 10,7,Front Lunge,8,10 each,30,8.5,Vest at 15% bodyweight. All right leg then all left. Start with a gentle 40 to 60cm step. This one hits the glutes hardest.
Workout 10,10,Wed,Workout 10,8,Goblet Squat to Press,8,10,45,8.5,Vest at 15% bodyweight.
Workout 10,10,Wed,Workout 10,9,Kettlebell Swing,8,10,45,8.5,Two handed.
Workout 10,10,Wed,Workout 10,10,Easy Aerobic,1,600s,60,4,Cool down.
Workout 11,11,Wed,Workout 11,1,Easy Aerobic,1,780s,60,5,Warm up. Build to a hard effort for the last two minutes. Rest 30s between exercises.
Workout 11,11,Wed,Workout 11,2,Floor Get-Up,1,10,30,5,Up off the floor from lying down. Any way you like.
Workout 11,11,Wed,Workout 11,3,Burpee,1,10,60,6,Finishes the warm up.
Workout 11,11,Wed,Workout 11,4,Split Jump Squat,8,10 each,30,8.5,Vest at 15% bodyweight. About one jump a second.
Workout 11,11,Wed,Workout 11,5,Squat Jump,8,10,30,8.5,Vest at 15% bodyweight. About one jump every half to one second.
Workout 11,11,Wed,Workout 11,6,Box Step-Up,8,10 each,20,8.5,Vest at 15% bodyweight. Box about three quarters of the way to your kneecap. All right leg then all left.
Workout 11,11,Wed,Workout 11,7,Front Lunge,8,10 each,20,8.5,Vest at 15% bodyweight. All right leg then all left. Start with a gentle 40 to 60cm step. This one hits the glutes hardest.
Workout 11,11,Wed,Workout 11,8,Goblet Squat to Press,8,10,30,8.5,Vest at 15% bodyweight.
Workout 11,11,Wed,Workout 11,9,Kettlebell Swing,8,10,30,8.5,Two handed.
Workout 11,11,Wed,Workout 11,10,Easy Aerobic,1,600s,60,4,Cool down.
Workout 12,12,Wed,Workout 12,1,Easy Aerobic,1,780s,60,5,Warm up. Build to a hard effort for the last two minutes. Rest 20s between exercises.
Workout 12,12,Wed,Workout 12,2,Floor Get-Up,1,10,30,5,Up off the floor from lying down. Any way you like.
Workout 12,12,Wed,Workout 12,3,Burpee,1,10,60,6,Finishes the warm up.
Workout 12,12,Wed,Workout 12,4,Split Jump Squat,8,10 each,15,8.5,Vest at 15% bodyweight. About one jump a second.
Workout 12,12,Wed,Workout 12,5,Squat Jump,8,10,15,8.5,Vest at 15% bodyweight. About one jump every half to one second.
Workout 12,12,Wed,Workout 12,6,Box Step-Up,8,10 each,15,8.5,Vest at 15% bodyweight. Box about three quarters of the way to your kneecap. All right leg then all left.
Workout 12,12,Wed,Workout 12,7,Front Lunge,8,10 each,15,8.5,Vest at 15% bodyweight. All right leg then all left. Start with a gentle 40 to 60cm step. This one hits the glutes hardest.
Workout 12,12,Wed,Workout 12,8,Goblet Squat to Press,8,10,15,8.5,Vest at 15% bodyweight.
Workout 12,12,Wed,Workout 12,9,Kettlebell Swing,8,10,15,8.5,Two handed.
Workout 12,12,Wed,Workout 12,10,Easy Aerobic,1,600s,60,4,Cool down.
Workout 13,13,Wed,Workout 13,1,Easy Aerobic,1,780s,60,5,Warm up. Build to a hard effort for the last two minutes. Rest 10s between exercises.
Workout 13,13,Wed,Workout 13,2,Floor Get-Up,1,10,30,5,Up off the floor from lying down. Any way you like.
Workout 13,13,Wed,Workout 13,3,Burpee,1,10,60,6,Finishes the warm up.
Workout 13,13,Wed,Workout 13,4,Split Jump Squat,8,10 each,10,8.5,Vest at 15% bodyweight. About one jump a second.
Workout 13,13,Wed,Workout 13,5,Squat Jump,8,10,10,8.5,Vest at 15% bodyweight. About one jump every half to one second.
Workout 13,13,Wed,Workout 13,6,Box Step-Up,8,10 each,10,8.5,Vest at 15% bodyweight. Box about three quarters of the way to your kneecap. All right leg then all left.
Workout 13,13,Wed,Workout 13,7,Front Lunge,8,10 each,10,8.5,Vest at 15% bodyweight. All right leg then all left. Start with a gentle 40 to 60cm step. This one hits the glutes hardest.
Workout 13,13,Wed,Workout 13,8,Goblet Squat to Press,8,10,10,8.5,Vest at 15% bodyweight.
Workout 13,13,Wed,Workout 13,9,Kettlebell Swing,8,10,10,8.5,Two handed.
Workout 13,13,Wed,Workout 13,10,Easy Aerobic,1,600s,60,4,Cool down.
Workout 14,14,Wed,Workout 14,1,Easy Aerobic,1,780s,60,5,Warm up. Build to a hard effort for the last two minutes. Rest 10s between exercises.
Workout 14,14,Wed,Workout 14,2,Floor Get-Up,1,10,30,5,Up off the floor from lying down. Any way you like.
Workout 14,14,Wed,Workout 14,3,Burpee,1,10,60,6,Finishes the warm up.
Workout 14,14,Wed,Workout 14,4,Split Jump Squat,8,10 each,10,8.5,Vest at 15% bodyweight. About one jump a second.
Workout 14,14,Wed,Workout 14,5,Squat Jump,8,10,10,8.5,Vest at 15% bodyweight. About one jump every half to one second.
Workout 14,14,Wed,Workout 14,6,Box Step-Up,8,10 each,10,8.5,Vest at 15% bodyweight. Box about three quarters of the way to your kneecap. All right leg then all left.
Workout 14,14,Wed,Workout 14,7,Front Lunge,8,10 each,10,8.5,Vest at 15% bodyweight. All right leg then all left. Start with a gentle 40 to 60cm step. This one hits the glutes hardest.
Workout 14,14,Wed,Workout 14,8,Goblet Squat to Press,8,10,10,8.5,Vest at 15% bodyweight.
Workout 14,14,Wed,Workout 14,9,Kettlebell Swing,8,10,10,8.5,Two handed.
Workout 14,14,Wed,Workout 14,10,Easy Aerobic,1,600s,60,4,Cool down.`,
  },
  {
    id: 'runner-strength-base',
    name: "Runner's Strength — Base",
    goal: 'endurance',
    level: 'beginner',
    days: 2,
    equipment: 'Full gym',
    summary: 'Twelve weeks of short heavy sessions. Built for running economy.',
    detail: 'Heavy, low-rep, low-volume lifting is the version of strength work that actually '
      + 'improves running economy — light circuits do not. Two sessions a week across a twelve-week '
      + 'block, building from sixes to triples.\n\n'
      + 'Nothing here goes near failure and the volume never gets high, because the running is the '
      + 'training and the gym must not cost it. Run this in base season when mileage is moderate. '
      + 'If a session leaves your legs wrecked for two days, cut a set rather than the weight.',
    spec: {
      length: 12,
      roleset: 'endurance',
      sessions: [
        { name: 'Heavy Lower', day: 'Tue', exercises: [
          ['Back Squat', 'main', 180],
          ['Romanian Deadlift', 'secondary', 150],
          ['Bulgarian Split Squat', 'accessory', 120],
          ['Single-Leg Calf Raise', 'isolation', 75],
          ['Plank', 'hold', 45, '45s'],
        ] },
        { name: 'Power and Posterior', day: 'Fri', exercises: [
          ['Trap Bar Deadlift', 'main', 180],
          ['Box Jump', 'power', 120],
          ['Hip Thrust', 'secondary', 120],
          ['Nordic Curl', 'accessory', 120],
          ['Copenhagen Plank', 'hold', 45, '20s each'],
        ] },
      ],
    },
  },

  {
    id: 'runner-strength-inseason',
    name: "Runner's Strength — In Season",
    goal: 'endurance',
    level: 'intermediate',
    days: 2,
    equipment: 'Full gym',
    summary: 'Eight weeks of maintenance. Keeps strength without stealing legs.',
    detail: 'When mileage and intensity go up, lifting has to get out of the way. Two short '
      + 'sessions a week at heavy loads and tiny volume — enough to hold onto strength, not enough '
      + 'to cost you a workout.\n\n'
      + 'Eight weeks so it has an end, with a deload and a light final week that lines up with a '
      + 'race taper. Two to three sets, three to six reps, always well short of failure. Put these '
      + 'on the same day as a hard run rather than on an easy day, so easy days stay easy.',
    spec: {
      length: 8,
      roleset: 'endurance',
      sessions: [
        { name: 'Maintain A', day: 'Tue', exercises: [
          ['Back Squat', 'main', 180],
          ['Single-Leg Romanian Deadlift', 'accessory', 90],
          ['Single-Leg Calf Raise', 'isolation', 60],
          ['Side Plank', 'hold', 45, '30s each'],
        ] },
        { name: 'Maintain B', day: 'Fri', exercises: [
          ['Trap Bar Deadlift', 'main', 180],
          ['Pogo Hop', 'power', 60],
          ['Hip Thrust', 'accessory', 90],
          ['Dead Bug', 'isolation', 45],
        ] },
      ],
    },
  },


  {
    id: 'mountain-general-strength',
    name: 'Mountain General Strength',
    goal: 'endurance',
    level: 'beginner',
    days: 3,
    weeks: 9,
    repeat: false,
    equipment: 'Full gym',
    summary: 'The nine weeks you do before you earn the right to train muscular endurance.',
    detail: 'General strength first, always. This is the block that makes a muscular endurance '
      + 'phase safe and worth doing: eight weeks moving from bodyweight competence through to '
      + 'genuinely heavy compound lifting, with single-leg work and core throughout. Weeks one '
      + 'to three are about movement quality, four to six add load, week seven backs off, and '
      + 'eight and nine get genuinely heavy. Run it in the off season when aerobic volume is '
      + 'lowest, and go straight into a muscular endurance block afterwards.',
    csv: `Phase,Weeks,Weekday,Workout,Order,Exercise,Sets,Reps,Rest (s),RPE,Notes
Foundation,1-3,Mon,Full Body A,1,Goblet Squat,3,12,90,7,Own the movement before you load it.
Foundation,1-3,Mon,Full Body A,2,Push-Up,3,12,90,7,
Foundation,1-3,Mon,Full Body A,3,Inverted Row,3,10,90,7,
Foundation,1-3,Mon,Full Body A,4,Single-Leg Glute Bridge,3,12 each,60,7,
Foundation,1-3,Mon,Full Body A,5,Plank,3,45s,45,,
Foundation,1-3,Wed,Full Body B,1,Box Step-Up,3,10 each,90,7,Bodyweight. Knee-height box.
Foundation,1-3,Wed,Full Body B,2,Romanian Deadlift,3,10,120,7,Light. Learn the hinge.
Foundation,1-3,Wed,Full Body B,3,Pike Push-Up,3,8,90,7,
Foundation,1-3,Wed,Full Body B,4,Bird Dog,3,10 each,45,,
Foundation,1-3,Fri,Full Body C,1,Reverse Lunge,3,10 each,90,7,
Foundation,1-3,Fri,Full Body C,2,Lat Pulldown,3,12,90,7,
Foundation,1-3,Fri,Full Body C,3,Single-Leg Calf Raise,3,15 each,60,7,
Foundation,1-3,Fri,Full Body C,4,Side Plank,3,30s each,45,,
Loading,4-6,Mon,Strength A,1,Back Squat,4,8,150,8,Now add weight every week.
Loading,4-6,Mon,Strength A,2,Barbell Bench Press,3,8,120,8,
Loading,4-6,Mon,Strength A,3,Barbell Row,3,8,120,8,
Loading,4-6,Mon,Strength A,4,Hip Thrust,3,10,90,8,
Loading,4-6,Mon,Strength A,5,Plank,3,60s,45,,
Loading,4-6,Wed,Strength B,1,Trap Bar Deadlift,4,8,150,8,
Loading,4-6,Wed,Strength B,2,Bulgarian Split Squat,3,10 each,120,8,
Loading,4-6,Wed,Strength B,3,Overhead Press,3,8,120,8,
Loading,4-6,Wed,Strength B,4,Copenhagen Plank,3,20s each,45,,
Loading,4-6,Fri,Strength C,1,Front Squat,3,8,150,8,
Loading,4-6,Fri,Strength C,2,Pull-Up,3,6,120,8,
Loading,4-6,Fri,Strength C,3,Nordic Curl,3,5,120,8,
Loading,4-6,Fri,Strength C,4,Farmer Carry,3,45s,90,8,Heavy. Stay tall.
Deload,7,Mon,Back Off A,1,Back Squat,2,5,150,5,Half the weight you finished the last block on.
Deload,7,Mon,Back Off A,2,Barbell Bench Press,2,5,120,5,
Deload,7,Mon,Back Off A,3,Plank,2,45s,45,,
Deload,7,Wed,Back Off B,1,Trap Bar Deadlift,2,5,150,5,Move well and leave.
Deload,7,Wed,Back Off B,2,Overhead Press,2,5,120,5,
Deload,7,Wed,Back Off B,3,Dead Bug,2,10 each,45,,
Deload,7,Fri,Back Off C,1,Front Squat,2,5,150,5,
Deload,7,Fri,Back Off C,2,Pull-Up,2,5,120,5,
Deload,7,Fri,Back Off C,3,Bird Dog,2,10 each,45,,
Max Strength,8-9,Mon,Heavy A,1,Back Squat,5,5,210,8.5,The heaviest weeks. Warm up thoroughly.
Max Strength,8-9,Mon,Heavy A,2,Barbell Bench Press,4,5,180,8.5,
Max Strength,8-9,Mon,Heavy A,3,Barbell Row,3,6,150,8,
Max Strength,8-9,Mon,Heavy A,4,Plank,3,60s,45,,
Max Strength,8-9,Wed,Heavy B,1,Trap Bar Deadlift,5,5,210,8.5,
Max Strength,8-9,Wed,Heavy B,2,Bulgarian Split Squat,3,8 each,120,8,
Max Strength,8-9,Wed,Heavy B,3,Overhead Press,4,5,150,8.5,
Max Strength,8-9,Wed,Heavy B,4,Hanging Leg Raise,3,12,60,8,
Max Strength,8-9,Fri,Heavy C,1,Front Squat,4,5,180,8.5,
Max Strength,8-9,Fri,Heavy C,2,Pull-Up,4,5,120,8.5,
Max Strength,8-9,Fri,Heavy C,3,Nordic Curl,3,6,120,8,
Max Strength,8-9,Fri,Heavy C,4,Farmer Carry,3,60s,90,8,`,
  },

  {
    id: 'trail-ultra-durability',
    name: 'Trail Ultra Durability',
    goal: 'endurance',
    level: 'intermediate',
    days: 3,
    equipment: 'Full gym',
    summary: 'Twelve weeks of eccentric and single-leg work. For the descents that wreck you.',
    detail: 'Downhill running is where trail races are actually lost, and it is eccentric loading '
      + 'that causes the damage. This block is built around controlled lowering — step-downs, slow '
      + 'Nordics, tempo squats — plus the single-leg stability work that keeps ankles and hips '
      + 'honest on uneven ground.\n\n'
      + 'Expect to be sore for the first fortnight; that is the point, and it stops once you adapt. '
      + 'The deload weeks are not optional here — eccentric work accumulates damage faster than it '
      + 'feels like it does.',
    spec: {
      length: 12,
      roleset: 'endurance',
      sessions: [
        { name: 'Eccentric Legs', day: 'Tue', exercises: [
          ['Back Squat', 'main', 180],
          ['Box Step-Down', 'secondary', 90],
          ['Nordic Curl', 'accessory', 120],
          ['Single-Leg Calf Raise', 'isolation', 60],
          ['Copenhagen Plank', 'hold', 45, '25s each'],
        ] },
        { name: 'Stability and Core', day: 'Thu', exercises: [
          ['Single-Leg Romanian Deadlift', 'main', 90],
          ['Lateral Lunge', 'secondary', 90],
          ['Monster Walk', 'isolation', 60],
          ['Pallof Press', 'accessory', 60],
          ['Side Plank', 'hold', 45, '40s each'],
        ] },
        { name: 'Power and Carry', day: 'Sat', exercises: [
          ['Trap Bar Deadlift', 'main', 180],
          ['Box Jump', 'power', 120],
          ['Walking Lunge', 'accessory', 90],
          ['Farmer Carry', 'hold', 90, '60s'],
          ['Hanging Leg Raise', 'isolation', 60],
        ] },
      ],
    },
  },

  {
    id: 'cyclist-strength',
    name: "Cyclist's Strength",
    goal: 'endurance',
    level: 'beginner',
    days: 2,
    equipment: 'Full gym',
    summary: 'Twelve weeks on the posterior chain and bone loading cycling never gives you.',
    detail: 'Cycling is a narrow movement: seated, one plane, no impact, and almost no work for the '
      + 'hamstrings or the bones. Two sessions a week across twelve weeks fix what the bike '
      + 'neglects.\n\n'
      + 'Heavy bilateral squatting and hinging for power, single-leg work for the imbalance every '
      + 'cyclist develops, jumping for bone density, and upper back work to undo the position. Low '
      + 'volume, high load, and never the day before a hard ride.',
    spec: {
      length: 12,
      roleset: 'endurance',
      sessions: [
        { name: 'Legs and Hinge', day: 'Tue', exercises: [
          ['Back Squat', 'main', 180],
          ['Romanian Deadlift', 'secondary', 150],
          ['Bulgarian Split Squat', 'accessory', 120],
          ['Standing Calf Raise', 'isolation', 75],
          ['Plank', 'hold', 45, '45s'],
        ] },
        { name: 'Power and Posture', day: 'Fri', exercises: [
          ['Trap Bar Deadlift', 'main', 180],
          ['Box Jump', 'power', 120],
          ['Barbell Row', 'secondary', 120],
          ['Face Pull', 'isolation', 60],
          ['Hip Thrust', 'accessory', 120],
        ] },
      ],
    },
  },

  {
    id: 'triathlete-strength',
    name: "Triathlete's Strength",
    goal: 'endurance',
    level: 'intermediate',
    days: 2,
    equipment: 'Full gym',
    summary: 'Twelve weeks of whole-body work that fits round three sports.',
    detail: 'Three disciplines already fill the week, so the gym gets two sessions and has to earn '
      + 'them. Heavy lower body for the bike and run, pulling and shoulder stability for the swim, '
      + 'and core work that ties the three together.\n\n'
      + 'Kept short on purpose and periodised so it still goes somewhere. If lifting starts costing '
      + 'you swim or run quality, cut a set rather than dropping the session.',
    spec: {
      length: 12,
      roleset: 'endurance',
      sessions: [
        { name: 'Lower and Pull', day: 'Tue', exercises: [
          ['Back Squat', 'main', 180],
          ['Romanian Deadlift', 'secondary', 150],
          ['Pull-Up', 'secondary', 120],
          ['Straight-Arm Pulldown', 'isolation', 60],
          ['Plank', 'hold', 45, '45s'],
        ] },
        { name: 'Power and Shoulders', day: 'Fri', exercises: [
          ['Trap Bar Deadlift', 'main', 180],
          ['Single-Leg Romanian Deadlift', 'accessory', 90],
          ['Seated Dumbbell Shoulder Press', 'secondary', 120],
          ['Face Pull', 'isolation', 60],
          ['Side Plank', 'hold', 45, '30s each'],
        ] },
      ],
    },
  },

  {
    id: 'hybrid-conditioning',
    name: 'Hybrid Conditioning',
    goal: 'endurance',
    level: 'intermediate',
    days: 4,
    equipment: 'Full gym plus sled and erg',
    summary: 'Twelve weeks of strength plus sleds, carries and ergs. For fitness-race formats.',
    detail: 'Built for the races that alternate running with functional stations — sled pushes, '
      + 'carries, wall balls, rowing. Two strength days keep you capable of moving heavy things; '
      + 'two mixed days train the specific skill of working hard with your heart rate already '
      + 'buried.\n\n'
      + 'The strength days periodise properly across the block while the conditioning days hold '
      + 'their shape, which is the right way round: you want the engine work consistent and the '
      + 'lifting progressive. The compromise is real — you will not get as strong as a pure '
      + 'strength block or as fit as a pure running one, which is exactly the trade these events '
      + 'ask for.',
    spec: {
      length: 12,
      roleset: 'endurance',
      sessions: [
        { name: 'Strength Lower', day: 'Mon', exercises: [
          ['Back Squat', 'main', 180],
          ['Romanian Deadlift', 'secondary', 150],
          ['Walking Lunge', 'accessory', 120],
          ['Standing Calf Raise', 'isolation', 60],
        ] },
        { name: 'Engine', day: 'Tue', exercises: [
          ['Ski Erg', 'hold', 60, '60s'],
          ['Sled Push', 'hold', 90, '30s'],
          ['Farmer Carry', 'hold', 60, '45s'],
          ['Wall Ball', 'accessory', 60],
        ] },
        { name: 'Strength Upper', day: 'Thu', exercises: [
          ['Barbell Bench Press', 'main', 180],
          ['Barbell Row', 'secondary', 150],
          ['Overhead Press', 'accessory', 120],
          ['Pull-Up', 'accessory', 120],
        ] },
        { name: 'Mixed', day: 'Sat', exercises: [
          ['Rowing Machine', 'hold', 90, '240s'],
          ['Burpee', 'accessory', 60],
          ['Sandbag Carry', 'hold', 90, '60s'],
          ['Kettlebell Swing', 'accessory', 60],
          ['Plank', 'hold', 45, '60s'],
        ] },
      ],
    },
  },

  {
    id: 'marathon-strength-12',
    name: 'Marathon Strength — 12 Week',
    goal: 'endurance',
    level: 'intermediate',
    days: 2,
    weeks: 12,
    repeat: false,
    equipment: 'Full gym',
    summary: 'Twelve weeks that back off as your mileage climbs. Ends race-ready.',
    detail: 'Strength work timed to a marathon build. Weeks one to four load heavily while '
      + 'mileage is still moderate, weeks five to eight hold strength with less volume as the long '
      + 'runs get long, weeks nine to eleven drop to pure maintenance, and week twelve is little '
      + 'more than movement. The whole design is about giving the running back what the lifting '
      + 'borrows, at the right time.',
    csv: `Phase,Weeks,Weekday,Workout,Order,Exercise,Sets,Reps,Rest (s),RPE,Notes
Load,1-4,Tue,Heavy Lower,1,Back Squat,4,5,180,8,Build weight each week while mileage is moderate.
Load,1-4,Tue,Heavy Lower,2,Romanian Deadlift,3,6,150,8,
Load,1-4,Tue,Heavy Lower,3,Bulgarian Split Squat,3,8 each,120,8,
Load,1-4,Tue,Heavy Lower,4,Single-Leg Calf Raise,3,12 each,75,8,
Load,1-4,Tue,Heavy Lower,5,Plank,3,45s,45,,
Load,1-4,Fri,Power,1,Trap Bar Deadlift,4,5,180,8,
Load,1-4,Fri,Power,2,Box Jump,4,4,120,7,
Load,1-4,Fri,Power,3,Hip Thrust,3,8,120,8,
Load,1-4,Fri,Power,4,Nordic Curl,3,5,120,8,
Load,1-4,Fri,Power,5,Copenhagen Plank,3,20s each,45,,
Hold,5-8,Tue,Heavy Lower,1,Back Squat,3,4,180,7,Same weight as week four. Fewer sets.
Hold,5-8,Tue,Heavy Lower,2,Romanian Deadlift,2,6,150,7,
Hold,5-8,Tue,Heavy Lower,3,Single-Leg Calf Raise,3,12 each,60,7,
Hold,5-8,Tue,Heavy Lower,4,Plank,3,45s,45,,
Hold,5-8,Fri,Power,1,Trap Bar Deadlift,3,4,180,7,
Hold,5-8,Fri,Power,2,Pogo Hop,3,20,60,6,
Hold,5-8,Fri,Power,3,Hip Thrust,2,8,90,7,
Hold,5-8,Fri,Power,4,Dead Bug,3,10 each,45,,
Maintain,9-11,Tue,Maintain A,1,Back Squat,2,4,180,6,Two sets. In and out. Legs belong to the long run now.
Maintain,9-11,Tue,Maintain A,2,Single-Leg Calf Raise,2,12 each,60,6,
Maintain,9-11,Tue,Maintain A,3,Side Plank,2,30s each,45,,
Maintain,9-11,Fri,Maintain B,1,Trap Bar Deadlift,2,4,180,6,
Maintain,9-11,Fri,Maintain B,2,Hip Thrust,2,8,90,6,
Maintain,9-11,Fri,Maintain B,3,Dead Bug,2,10 each,45,,
Taper,12,Tue,Movement A,1,Goblet Squat,2,8,90,5,Nothing heavy. Just move.
Taper,12,Tue,Movement A,2,Glute Bridge,2,12,60,5,
Taper,12,Fri,Movement B,1,Single-Leg Glute Bridge,2,10 each,60,5,
Taper,12,Fri,Movement B,2,Bird Dog,2,10 each,45,,`,
  },
];
