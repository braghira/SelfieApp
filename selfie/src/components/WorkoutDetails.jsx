import PropTypes from "prop-types";

const WorkoutDetails = ({ workout }) => {
    return (
        <div className="workout-details flex justify-start">
            <div className="block max-w-[18rem] rounded-lg border border-blue-800 bg-surface-dark shadow-slate-950">
                <div className="border-b-2 border-neutral-100 px-6 py-3 text-surface dark:border-white/10 dark:text-white">
                    {workout.title}
                </div>
                <div className="p-6">
                    <h5 className="mb-2 text-xl font-medium leading-tight text-primary">
                        {workout.load}
                    </h5>
                    <p className="mb-2 text-xl font-medium leading-tight text-primary">
                        {workout.reps}
                    </p>
                    <p>{workout.createdAt}</p>
                </div>
            </div>
        </div>
    );
};

WorkoutDetails.propTypes = {
    workout: PropTypes.shape({
        title: PropTypes.string.isRequired,
        load: PropTypes.number.isRequired,
        reps: PropTypes.number.isRequired,
        createdAt: PropTypes.string.isRequired,
    }).isRequired,
};

export default WorkoutDetails;
